from typing import Any

from app.services.quantum import qiskit_aer

SUPPORTED_BACKENDS = {"qiskit_aer", "pennylane", "cirq", "qbraid"}


def run_circuit(circuit: dict[str, Any], backend_name: str = "qiskit_aer") -> dict[str, Any]:
    """Run a circuit (in the shared circuit_json shape) against a named backend.

    Returns {"counts": {...}, "statevector": [[re, im], ...], "bloch_vector": [x,y,z] | None}.
    New backends plug in here without changing this signature.
    """
    if backend_name == "qiskit_aer":
        return qiskit_aer.run(circuit)

    if backend_name in SUPPORTED_BACKENDS:
        raise NotImplementedError(f"Backend '{backend_name}' is not implemented yet.")

    raise ValueError(f"Unknown backend '{backend_name}'.")
