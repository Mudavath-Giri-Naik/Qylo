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
  const a = `q${q0}`;
  const b = `q${q1}`;
  switch (gate.type) {
    case "H":
      return `circuit.append(cirq.H(${a}))`;
    case "X":
      return `circuit.append(cirq.X(${a}))`;
    case "Y":
      return `circuit.append(cirq.Y(${a}))`;
    case "Z":
      return `circuit.append(cirq.Z(${a}))`;
    case "I":
      return `circuit.append(cirq.I(${a}))`;
    case "S":
      return `circuit.append(cirq.S(${a}))`;
    case "SDG":
      return `circuit.append(cirq.S(${a}) ** -1)`;
    case "T":
      return `circuit.append(cirq.T(${a}))`;
    case "TDG":
      return `circuit.append(cirq.T(${a}) ** -1)`;
    case "SX":
      return `circuit.append(cirq.X(${a}) ** 0.5)`;
    case "P":
      return `circuit.append(cirq.ZPowGate(exponent=(${formatAngle(gate.angle)}) / np.pi)(${a}))`;
    case "RX":
      return `circuit.append(cirq.rx(${formatAngle(gate.angle)})(${a}))`;
    case "RY":
      return `circuit.append(cirq.ry(${formatAngle(gate.angle)})(${a}))`;
    case "RZ":
      return `circuit.append(cirq.rz(${formatAngle(gate.angle)})(${a}))`;
    case "RESET":
      return `circuit.append(cirq.ResetChannel()(${a}))`;
    case "CNOT":
      return `circuit.append(cirq.CNOT(${a}, ${b}))`;
    case "CZ":
      return `circuit.append(cirq.CZ(${a}, ${b}))`;
    case "CY":
      return `circuit.append(cirq.Y(${b}).controlled_by(${a}))`;
    case "MEASURE":
      return `circuit.append(cirq.measure(${a}, key='q${q0}'))`;
    default:
      return `# unknown gate ${gate.type}`;
  }
}

/** A Cirq rendering of the circuit, for reference/export. Only Qiskit Aer
 * actually executes on the backend today -- this is not round-tripped back
 * into the canvas (no parser), same as PennyLane. */
export function generateCirqCode(circuit: CircuitJson): string {
  const usesAngle = circuit.gates.some((g) => g.angle !== undefined);
  const header = usesAngle ? "import numpy as np\nimport cirq" : "import cirq";
  const qubitNames =
    Array.from({ length: circuit.num_qubits }, (_, i) => `q${i}`).join(", ") +
    (circuit.num_qubits === 1 ? "," : "");

  const sorted = [...circuit.gates].sort((a, b) => a.step - b.step);
  const body = sorted.map((g) => lineFor(g)).join("\n");

  const lines = [
    header,
    "",
    `${qubitNames} = cirq.LineQubit.range(${circuit.num_qubits})`,
    "circuit = cirq.Circuit()",
    "",
    body || "# drag gates onto the canvas to generate code",
  ];

  return lines.join("\n");
}
