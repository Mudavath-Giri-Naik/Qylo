import logging
import math
import re
import time
from typing import Any, Optional, TypedDict

from langgraph.graph import END, StateGraph

from app.services import db, gemini, qdrant_store

logger = logging.getLogger(__name__)

LANGUAGE_NAMES = {"en": "English", "hi": "Hindi", "te": "Telugu"}

PROGRESS_KEYWORDS = [
    "what should i study",
    "what should i learn",
    "what's next",
    "whats next",
    "what next",
    "what to study",
    "what to learn",
    "recommend a lesson",
    "recommend a module",
    "what do i do next",
    "what should i do next",
]
CODEGEN_KEYWORDS = [
    "write",
    "generate",
    "create a circuit",
    "build a circuit",
    "give me code",
    "give me the code",
    "code for",
    "implement",
]


class AgentState(TypedDict, total=False):
    question: str
    circuit_json: Optional[dict[str, Any]]
    module_code: Optional[str]
    user_id: Optional[str]
    preferred_language: str
    history: list[dict[str, str]]
    intent: str
    answer: str
    sources: list[dict[str, Any]]


def language_instruction(lang: str) -> str:
    name = LANGUAGE_NAMES.get(lang, "English")
    return f"Respond in {name}, regardless of what language the question or context is written in."


def _has_circuit(state: AgentState) -> bool:
    circuit = state.get("circuit_json")
    return bool(circuit and circuit.get("gates") is not None)


def route(state: AgentState) -> str:
    question = (state.get("question") or "").lower()
    has_circuit = _has_circuit(state)

    if not has_circuit and any(k in question for k in PROGRESS_KEYWORDS):
        return "progress"
    if has_circuit and any(k in question for k in CODEGEN_KEYWORDS):
        return "rag_circuit"
    if has_circuit:
        return "circuit"
    return "rag"


def router_node(state: AgentState) -> dict[str, Any]:
    return {"intent": route(state)}


def format_circuit(circuit_json: dict[str, Any]) -> str:
    num_qubits = circuit_json.get("num_qubits")
    gates = circuit_json.get("gates") or []
    if not gates:
        return f"{num_qubits} qubits, no gates placed yet."
    lines = [f"{num_qubits} qubits."]
    for gate in sorted(gates, key=lambda g: g.get("step", 0)):
        line = f"step {gate.get('step')}: {gate['type']} on qubit(s) {gate['qubits']}"
        if gate.get("angle") is not None:
            line += f", angle={gate['angle']:.4f} rad"
        lines.append(line)
    return "\n".join(lines)


_STOPWORDS = {
    "the", "and", "for", "are", "was", "what", "how", "why", "does", "did", "can", "you", "your",
    "this", "that", "with", "from", "into", "about", "explain", "briefly", "tell", "me", "is", "of",
    "to", "in", "on", "an", "it", "do", "a", "be", "by", "or", "as", "at", "which", "when", "who",
}


def _keyword_context(question: str, module_code: str | None) -> tuple[str, list[dict]]:
    """Fallback retrieval straight from the lessons table, for when the vector
    store is unreachable (e.g. a suspended Qdrant cluster) or hasn't been
    re-ingested since new lessons were added. Scores English lessons by word
    overlap with the question, favouring the current module."""
    words = {w for w in re.findall(r"[a-z0-9]+", question.lower()) if len(w) > 1 and w not in _STOPWORDS}
    lessons = [l for l in db.get_all_lessons() if l.get("language") == "en"]
    texts = [(l["title"].lower(), l["body_markdown"].lower()) for l in lessons]

    # Rare words ("t2", "bb84", "decoherence") say far more about which lesson
    # is relevant than words every lesson uses ("qubit", "state").
    weight = {
        w: math.log((len(texts) + 1) / (1 + sum(w in title or w in body for title, body in texts)))
        for w in words
    }

    def score(index: int) -> float:
        title, body = texts[index]
        s = sum(weight[w] * (3 * (w in title) + min(body.count(w), 5)) for w in words)
        return s + (2 if module_code and lessons[index]["module_code"] == module_code else 0)

    ranked = [lessons[i] for i in sorted(range(len(lessons)), key=score, reverse=True)[:3]]

    context = "\n\n---\n\n".join(f"# {l['title']}\n\n{l['body_markdown'][:4000]}" for l in ranked)
    sources = [{"module_code": l["module_code"], "title": l["title"]} for l in ranked]
    return context, sources


# After a vector-store failure, skip it for a while instead of paying the
# embedding + connection cost on every question.
_VECTOR_RETRY_SECONDS = 300
_vector_down_until = 0.0


def _retrieve_context(question: str, module_code: str | None) -> tuple[str, list[dict]]:
    global _vector_down_until
    if time.time() < _vector_down_until:
        return _keyword_context(question, module_code)
    try:
        query_vector = gemini.embed_text(question, task_type="RETRIEVAL_QUERY")
        hits = qdrant_store.search(query_vector, limit=5, module_code=module_code)
    except Exception:  # noqa: BLE001 - any vector-store failure degrades to keyword retrieval
        logger.exception("Vector retrieval failed; using keyword retrieval from lessons for a while")
        _vector_down_until = time.time() + _VECTOR_RETRY_SECONDS
        return _keyword_context(question, module_code)
    context = "\n\n---\n\n".join(h.payload.get("chunk_text", "") for h in hits if h.payload)
    if not context.strip():
        return _keyword_context(question, module_code)
    return context, [h.payload for h in hits if h.payload]


def rag_node(state: AgentState) -> dict[str, Any]:
    question = state.get("question") or "Explain this lesson."
    context, sources = _retrieve_context(question, state.get("module_code"))

    system_instruction = (
        "You are a quantum computing tutor for the Qylo learning platform. "
        "Answer only using the provided context below. If the answer isn't in "
        "the context, say you don't have that information rather than guessing. "
        + language_instruction(state["preferred_language"])
    )
    prompt = f"Context:\n{context}\n\nQuestion: {question}"
    answer = gemini.generate(system_instruction, prompt, state.get("history"))
    return {"answer": answer, "sources": sources}


def circuit_node(state: AgentState) -> dict[str, Any]:
    question = state.get("question") or "Explain what this circuit does."
    circuit_description = format_circuit(state["circuit_json"] or {})

    system_instruction = (
        "You are a quantum computing tutor for the Qylo learning platform, reviewing a "
        "student's circuit. Describe what the circuit does, point out any likely "
        "mistakes, and suggest one concrete optimization if there is one. "
        + language_instruction(state["preferred_language"])
    )
    prompt = f"Circuit:\n{circuit_description}\n\nStudent's question: {question}"
    answer = gemini.generate(system_instruction, prompt, state.get("history"))
    return {"answer": answer}


def rag_circuit_node(state: AgentState) -> dict[str, Any]:
    question = state.get("question") or "Write code for this."
    context, sources = _retrieve_context(question, state.get("module_code"))
    circuit_description = format_circuit(state["circuit_json"] or {})

    system_instruction = (
        "You are a quantum computing tutor for the Qylo learning platform. Use the "
        "lesson context below to ground any conceptual or algorithmic explanation, and "
        "the student's current circuit for anything circuit-specific. If asked to write "
        "or modify code, produce Qiskit-style Python (qc.h(0), qc.cx(0, 1), etc.). If "
        "the context doesn't cover something, say so rather than guessing. "
        + language_instruction(state["preferred_language"])
    )
    prompt = (
        f"Lesson context:\n{context}\n\nCurrent circuit:\n{circuit_description}\n\n"
        f"Question: {question}"
    )
    answer = gemini.generate(system_instruction, prompt, state.get("history"))
    return {"answer": answer, "sources": sources}


def _format_lesson_directory(lessons: list[dict[str, Any]]) -> str:
    by_module: dict[str, list[str]] = {}
    for lesson in lessons:
        by_module.setdefault(lesson["module_code"], []).append(lesson["title"])
    return "\n".join(
        f"{module_code}: {', '.join(titles)}" for module_code, titles in by_module.items()
    )


def progress_node(state: AgentState) -> dict[str, Any]:
    user_id = state.get("user_id")
    progress_rows = db.get_progress(user_id) if user_id else []
    submission_rows = db.get_submissions(user_id) if user_id else []
    directory = _format_lesson_directory(db.get_lesson_directory())

    if not progress_rows and not submission_rows:
        summary = "This student has no recorded progress yet."
    else:
        completed = [p.get("module_code") for p in progress_rows if p.get("status") == "completed"]
        in_progress = [p.get("module_code") for p in progress_rows if p.get("status") != "completed"]
        low_scores = [
            s.get("challenge_id") for s in submission_rows if (s.get("score") or 0) < 50
        ]
        summary = (
            f"Completed modules: {completed or 'none'}. "
            f"In-progress modules: {in_progress or 'none'}. "
            f"Challenges with a low score (possible struggle areas): {low_scores or 'none'}."
        )

    system_instruction = (
        "You are a quantum computing tutor for the Qylo learning platform. Based on the "
        "student's progress summary and the real list of available modules/lessons "
        "below, suggest ONE specific next lesson for them to try, with a short reason "
        "why. Only ever name a module code or lesson title that appears in the provided "
        "list -- never invent one. "
        + language_instruction(state["preferred_language"])
    )
    prompt = (
        f"Available modules and lessons (module_code: lesson titles in order):\n{directory}\n\n"
        f"Progress summary:\n{summary}\n\nStudent's question: {state.get('question', '')}"
    )
    answer = gemini.generate(system_instruction, prompt, state.get("history"))
    return {"answer": answer}


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("router", router_node)
    graph.add_node("rag", rag_node)
    graph.add_node("circuit", circuit_node)
    graph.add_node("rag_circuit", rag_circuit_node)
    graph.add_node("progress", progress_node)

    graph.set_entry_point("router")
    graph.add_conditional_edges(
        "router",
        lambda state: state["intent"],
        {"rag": "rag", "circuit": "circuit", "rag_circuit": "rag_circuit", "progress": "progress"},
    )
    graph.add_edge("rag", END)
    graph.add_edge("circuit", END)
    graph.add_edge("rag_circuit", END)
    graph.add_edge("progress", END)

    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph
