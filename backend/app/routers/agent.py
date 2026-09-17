from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agent.graph import get_graph
from app.services import db

router = APIRouter(prefix="/api/agent", tags=["agent"])


class Gate(BaseModel):
    type: str
    qubits: list[int]
    step: int
    angle: float | None = None


class Circuit(BaseModel):
    num_qubits: int
    gates: list[Gate] = []


class HistoryTurn(BaseModel):
    role: str
    content: str


class AskRequest(BaseModel):
    user_id: str
    question: str | None = None
    circuit: Circuit | None = None
    module_code: str | None = None
    history: list[HistoryTurn] = []


class AskResponse(BaseModel):
    answer: str
    intent: str


@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    user = db.get_user(request.user_id)
    preferred_language = (user or {}).get("preferred_language") or "en"

    state = {
        "question": request.question or "",
        "circuit_json": request.circuit.model_dump() if request.circuit else None,
        "module_code": request.module_code,
        "user_id": request.user_id,
        "preferred_language": preferred_language,
        "history": [turn.model_dump() for turn in request.history],
    }

    try:
        result = get_graph().invoke(state)
    except Exception as exc:  # noqa: BLE001 - surface as a clean 502 to the client
        raise HTTPException(status_code=502, detail=f"Agent failed: {exc}") from exc

    return AskResponse(answer=result.get("answer", ""), intent=result.get("intent", ""))
