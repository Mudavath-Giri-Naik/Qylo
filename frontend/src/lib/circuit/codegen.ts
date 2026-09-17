import type { CircuitJson, Gate } from "@/lib/circuit/types";

function formatAngle(angle: number | undefined): string {
  if (angle === undefined) return "0.0";
  // Keep it readable: recognize common fractions of pi, otherwise a decimal.
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
      return `qc.h(${q0})`;
    case "X":
      return `qc.x(${q0})`;
    case "Y":
      return `qc.y(${q0})`;
    case "Z":
      return `qc.z(${q0})`;
    case "I":
      return `qc.id(${q0})`;
    case "S":
      return `qc.s(${q0})`;
    case "SDG":
      return `qc.sdg(${q0})`;
    case "T":
      return `qc.t(${q0})`;
    case "TDG":
      return `qc.tdg(${q0})`;
    case "SX":
      return `qc.sx(${q0})`;
    case "P":
      return `qc.p(${formatAngle(gate.angle)}, ${q0})`;
    case "RX":
      return `qc.rx(${formatAngle(gate.angle)}, ${q0})`;
    case "RY":
      return `qc.ry(${formatAngle(gate.angle)}, ${q0})`;
    case "RZ":
      return `qc.rz(${formatAngle(gate.angle)}, ${q0})`;
    case "RESET":
      return `qc.reset(${q0})`;
    case "CNOT":
      return `qc.cx(${q0}, ${q1})`;
    case "CZ":
      return `qc.cz(${q0}, ${q1})`;
    case "CY":
      return `qc.cy(${q0}, ${q1})`;
    case "MEASURE":
      return `qc.measure(${q0}, ${q0})`;
    default:
      return `# unknown gate ${gate.type}`;
  }
}

export function generateQiskitCode(circuit: CircuitJson): string {
  const usesAngle = circuit.gates.some((g) => g.angle !== undefined);
  const header = usesAngle
    ? "import numpy as np\nfrom qiskit import QuantumCircuit"
    : "from qiskit import QuantumCircuit";

  const sorted = [...circuit.gates].sort((a, b) => a.step - b.step);
  const body = sorted.map((g) => lineFor(g)).join("\n");

  const lines = [
    header,
    "",
    `qc = QuantumCircuit(${circuit.num_qubits}, ${circuit.num_qubits})`,
    body || "# drag gates onto the canvas to generate code",
  ];

  return lines.join("\n");
}
