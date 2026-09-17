import type { CircuitJson, Gate } from "@/lib/circuit/types";

function formatAngle(angle: number | undefined): string {
  if (angle === undefined) return "0.0";
  const piFractions: [number, string][] = [
    [Math.PI / 4, "np.pi / 4"],
    [Math.PI / 2, "np.pi / 2"],
    [Math.PI, "np.pi"],
    [(3 * Math.PI) / 2, "3 * np.pi / 2"],
    [-Math.PI / 2, "-np.pi / 2"],
    [-Math.PI / 4, "-np.pi / 4"],
  ];
  const match = piFractions.find(([v]) => Math.abs(v - angle) < 1e-9);
  return match ? match[1] : angle.toFixed(4);
}

function lineFor(gate: Gate): string {
  const [q0, q1] = gate.qubits;
  switch (gate.type) {
    case "H":
      return `    qml.Hadamard(wires=${q0})`;
    case "X":
      return `    qml.PauliX(wires=${q0})`;
    case "Y":
      return `    qml.PauliY(wires=${q0})`;
    case "Z":
      return `    qml.PauliZ(wires=${q0})`;
    case "I":
      return `    qml.Identity(wires=${q0})`;
    case "S":
      return `    qml.S(wires=${q0})`;
    case "SDG":
      return `    qml.adjoint(qml.S)(wires=${q0})`;
    case "T":
      return `    qml.T(wires=${q0})`;
    case "TDG":
      return `    qml.adjoint(qml.T)(wires=${q0})`;
    case "SX":
      return `    qml.SX(wires=${q0})`;
    case "P":
      return `    qml.PhaseShift(${formatAngle(gate.angle)}, wires=${q0})`;
    case "RX":
      return `    qml.RX(${formatAngle(gate.angle)}, wires=${q0})`;
    case "RY":
      return `    qml.RY(${formatAngle(gate.angle)}, wires=${q0})`;
    case "RZ":
      return `    qml.RZ(${formatAngle(gate.angle)}, wires=${q0})`;
    case "RESET":
      return `    qml.measure(wires=${q0}, reset=True)`;
    case "CNOT":
      return `    qml.CNOT(wires=[${q0}, ${q1}])`;
    case "CZ":
      return `    qml.CZ(wires=[${q0}, ${q1}])`;
    case "CY":
      return `    qml.CY(wires=[${q0}, ${q1}])`;
    case "MEASURE":
      return `    # measure wire ${q0} (see the return statement below)`;
    default:
      return `    # unknown gate ${gate.type}`;
  }
}

/** A PennyLane rendering of the circuit, for reference/export. Only Qiskit
 * Aer actually executes on the backend today -- this is not round-tripped
 * back into the canvas (no parser), same as Cirq. */
export function generatePennylaneCode(circuit: CircuitJson): string {
  const usesAngle = circuit.gates.some((g) => g.angle !== undefined);
  const header = usesAngle ? "import numpy as np\nimport pennylane as qml" : "import pennylane as qml";

  const sorted = [...circuit.gates].sort((a, b) => a.step - b.step);
  const body = sorted.map((g) => lineFor(g)).join("\n");

  const lines = [
    header,
    "",
    `dev = qml.device("default.qubit", wires=${circuit.num_qubits})`,
    "",
    "@qml.qnode(dev)",
    "def circuit():",
    body || "    pass  # drag gates onto the canvas to generate code",
    `    return qml.probs(wires=range(${circuit.num_qubits}))`,
  ];

  return lines.join("\n");
}
