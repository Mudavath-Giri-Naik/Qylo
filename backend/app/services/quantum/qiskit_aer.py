from typing import Any

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

SHOTS = 1024

# Each builder takes (circuit, qubits, angle) and appends the gate.
_SINGLE_QUBIT_GATES: dict[str, Any] = {
    "H": lambda qc, q, a: qc.h(q[0]),
    "X": lambda qc, q, a: qc.x(q[0]),
    "Y": lambda qc, q, a: qc.y(q[0]),
    "Z": lambda qc, q, a: qc.z(q[0]),
    "S": lambda qc, q, a: qc.s(q[0]),
    "SDG": lambda qc, q, a: qc.sdg(q[0]),
    "T": lambda qc, q, a: qc.t(q[0]),
    "TDG": lambda qc, q, a: qc.tdg(q[0]),
    "SX": lambda qc, q, a: qc.sx(q[0]),
    "I": lambda qc, q, a: qc.id(q[0]),
    "P": lambda qc, q, a: qc.p(a or 0.0, q[0]),
    "RX": lambda qc, q, a: qc.rx(a or 0.0, q[0]),
    "RY": lambda qc, q, a: qc.ry(a or 0.0, q[0]),
    "RZ": lambda qc, q, a: qc.rz(a or 0.0, q[0]),
    "RESET": lambda qc, q, a: qc.reset(q[0]),
}

_TWO_QUBIT_GATES: dict[str, Any] = {
    "CNOT": lambda qc, q: qc.cx(q[0], q[1]),
    "CZ": lambda qc, q: qc.cz(q[0], q[1]),
    "CY": lambda qc, q: qc.cy(q[0], q[1]),
}


def _validate(circuit: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    num_qubits = circuit.get("num_qubits")
    if not isinstance(num_qubits, int) or not (1 <= num_qubits <= 5):
        raise ValueError("num_qubits must be an integer between 1 and 5")

    gates = circuit.get("gates", [])
    for gate in gates:
        qubits = gate.get("qubits", [])
        for q in qubits:
            if not (0 <= q < num_qubits):
                raise ValueError(f"gate references qubit {q}, out of range for {num_qubits} qubits")

    return num_qubits, sorted(gates, key=lambda g: g.get("step", 0))


def _apply_gates(qc: QuantumCircuit, gates: list[dict[str, Any]]) -> None:
    for gate in gates:
        gtype = gate["type"]
        qubits = gate["qubits"]

        if gtype == "MEASURE":
            continue

        two_qubit_builder = _TWO_QUBIT_GATES.get(gtype)
        if two_qubit_builder is not None:
            if len(qubits) != 2:
                raise ValueError(f"{gtype} requires exactly 2 qubits (control, target)")
            two_qubit_builder(qc, qubits)
            continue

        builder = _SINGLE_QUBIT_GATES.get(gtype)
        if builder is None:
            raise ValueError(f"Unknown gate type '{gtype}'")
        builder(qc, qubits, gate.get("angle"))


def run(circuit: dict[str, Any]) -> dict[str, Any]:
    num_qubits, gates = _validate(circuit)

    # Statevector: build the circuit with unitary gates only (no measurement,
    # which would collapse the state and make it meaningless to inspect).
    unitary_qc = QuantumCircuit(num_qubits)
    _apply_gates(unitary_qc, gates)
    statevector = Statevector.from_instruction(unitary_qc)
    amplitudes = [[float(amp.real), float(amp.imag)] for amp in statevector.data]

    bloch_vector = None
    if num_qubits == 1:
        a, b = statevector.data[0], statevector.data[1]
        bloch_vector = [
            float(2 * (a.conjugate() * b).real),
            float(2 * (a.conjugate() * b).imag),
            float((abs(a) ** 2) - (abs(b) ** 2)),
        ]

    # Counts: same gates, plus measurement. Explicit MEASURE entries pick which
    # qubits to read out; with none given, measure every qubit (so "Run" always
    # produces a histogram even before a student adds a MEASURE gate).
    measured_qc = QuantumCircuit(num_qubits, num_qubits)
    _apply_gates(measured_qc, gates)

    measure_gates = [g for g in gates if g["type"] == "MEASURE"]
    if measure_gates:
        measured_qubits = sorted({q for g in measure_gates for q in g["qubits"]})
    else:
        measured_qubits = list(range(num_qubits))
    for q in measured_qubits:
        measured_qc.measure(q, q)

    simulator = AerSimulator()
    result = simulator.run(measured_qc, shots=SHOTS).result()
    counts = {str(k): int(v) for k, v in result.get_counts().items()}

    return {
        "counts": counts,
        "statevector": amplitudes,
        "bloch_vector": bloch_vector,
    }
