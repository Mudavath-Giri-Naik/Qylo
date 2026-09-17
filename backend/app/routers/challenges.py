from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agent.graph import get_graph
from app.routers.circuits import Circuit
from app.services import db
from app.services.grading import grade_circuit_result, grade_quiz
from app.services.quantum import run_circuit

router = APIRouter(prefix="/challenges", tags=["challenges"])


class SubmitRequest(BaseModel):
    user_id: str
    selected_index: int | None = None
    circuit: Circuit | None = None


class SubmitResponse(BaseModel):
    passed: bool
    score: float
    ai_feedback: str | None = None


@router.post("/{challenge_id}/submit", response_model=SubmitResponse)
def submit(challenge_id: str, request: SubmitRequest) -> SubmitResponse:
    challenge = db.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    grading_rule = challenge.get("grading_rule") or {}
    challenge_type = grading_rule.get("type")

    if challenge_type == "quiz":
        if request.selected_index is None:
            raise HTTPException(status_code=400, detail="selected_index is required for a quiz")
        passed, score = grade_quiz(grading_rule, request.selected_index)
        submitted_data = {"type": "quiz", "selected_index": request.selected_index}
        ai_feedback = None

    elif challenge_type == "circuit":
        if request.circuit is None:
            raise HTTPException(status_code=400, detail="circuit is required for this challenge")
        circuit_dict = request.circuit.model_dump()
        try:
            result = run_circuit(circuit_dict, "qiskit_aer")
        except (ValueError, NotImplementedError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        passed, score, actual_probs = grade_circuit_result(grading_rule, result["counts"])
        submitted_data = {
            "type": "circuit",
            "circuit_json": circuit_dict,
            "counts": result["counts"],
        }

        ai_feedback = None
        if not passed:
            user = db.get_user(request.user_id)
            preferred_language = (user or {}).get("preferred_language") or "en"
            agent_state = {
                "question": (
                    "My submission for this circuit challenge didn't pass. Expected "
                    f"measurement distribution: {grading_rule.get('expected_counts')}. "
                    f"What I actually got: { {k: round(v, 3) for k, v in actual_probs.items()} }. "
                    "What's wrong with my circuit, and how should I fix it?"
                ),
                "circuit_json": circuit_dict,
                "module_code": challenge.get("module_code"),
                "user_id": request.user_id,
                "preferred_language": preferred_language,
                "history": [],
            }
            try:
                agent_result = get_graph().invoke(agent_state)
                ai_feedback = agent_result.get("answer")
            except Exception:  # noqa: BLE001 - feedback is best-effort, grading must still succeed
                ai_feedback = None
    else:
        raise HTTPException(status_code=400, detail=f"Unknown challenge type '{challenge_type}'")

    db.insert_submission(request.user_id, challenge_id, submitted_data, score, ai_feedback)

    if passed:
        db.mark_module_completed(request.user_id, challenge["module_code"])

    return SubmitResponse(passed=passed, score=score, ai_feedback=ai_feedback)
