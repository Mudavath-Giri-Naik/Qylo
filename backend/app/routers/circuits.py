from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.quantum import run_circuit

router = APIRouter(prefix="/circuits", tags=["circuits"])


class Gate(BaseModel):
    type: str
    qubits: list[int]
    step: int
    angle: float | None = None


class Circuit(BaseModel):
    num_qubits: int = Field(ge=1, le=5)
    gates: list[Gate] = []


class RunCircuitRequest(BaseModel):
    circuit: Circuit
    backend_name: str = "qiskit_aer"


class RunCircuitResponse(BaseModel):
    counts: dict[str, int]
    statevector: list[list[float]]
    bloch_vector: list[float] | None = None


@router.post("/run", response_model=RunCircuitResponse)
def run(request: RunCircuitRequest):
    try:
        return run_circuit(request.circuit.model_dump(), request.backend_name)
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
