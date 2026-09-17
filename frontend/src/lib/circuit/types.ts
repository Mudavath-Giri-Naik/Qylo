export type GateType =
  | "H"
  | "X"
  | "Y"
  | "Z"
  | "S"
  | "T"
  | "RX"
  | "RY"
  | "RZ"
  | "CNOT"
  | "MEASURE";

export interface Gate {
  type: GateType;
  qubits: number[];
  step: number;
  angle?: number;
}

export interface CircuitJson {
  num_qubits: number;
  gates: Gate[];
}

export interface GateDef {
  type: GateType;
  label: string;
  numQubits: 1 | 2;
  hasAngle: boolean;
  description: string;
  /** CSS custom property (defined in globals.css) used to color this gate's icon. */
  colorVar: string;
}

export const GATE_DEFS: GateDef[] = [
  { type: "H", label: "H", numQubits: 1, hasAngle: false, description: "Hadamard", colorVar: "--gate-h" },
  { type: "X", label: "X", numQubits: 1, hasAngle: false, description: "Pauli-X (NOT)", colorVar: "--gate-pauli" },
  { type: "Y", label: "Y", numQubits: 1, hasAngle: false, description: "Pauli-Y", colorVar: "--gate-pauli" },
  { type: "Z", label: "Z", numQubits: 1, hasAngle: false, description: "Pauli-Z", colorVar: "--gate-pauli" },
  { type: "S", label: "S", numQubits: 1, hasAngle: false, description: "S (phase)", colorVar: "--gate-phase" },
  { type: "T", label: "T", numQubits: 1, hasAngle: false, description: "T (π/8 phase)", colorVar: "--gate-phase" },
  { type: "RX", label: "RX", numQubits: 1, hasAngle: true, description: "Rotate X", colorVar: "--gate-rotation" },
  { type: "RY", label: "RY", numQubits: 1, hasAngle: true, description: "Rotate Y", colorVar: "--gate-rotation" },
  { type: "RZ", label: "RZ", numQubits: 1, hasAngle: true, description: "Rotate Z", colorVar: "--gate-rotation" },
  { type: "CNOT", label: "CNOT", numQubits: 2, hasAngle: false, description: "Controlled-NOT", colorVar: "--gate-two-qubit" },
  { type: "MEASURE", label: "M", numQubits: 1, hasAngle: false, description: "Measure", colorVar: "--gate-measure" },
];

export const ANGLE_PRESETS: { label: string; value: number }[] = [
  { label: "π/4", value: Math.PI / 4 },
  { label: "π/2", value: Math.PI / 2 },
  { label: "π", value: Math.PI },
  { label: "3π/2", value: (3 * Math.PI) / 2 },
  { label: "-π/2", value: -Math.PI / 2 },
  { label: "-π/4", value: -Math.PI / 4 },
];

export function gateDef(type: GateType): GateDef {
  const def = GATE_DEFS.find((g) => g.type === type);
  if (!def) throw new Error(`Unknown gate type ${type}`);
  return def;
}

export function emptyCircuit(numQubits: number): CircuitJson {
  return { num_qubits: numQubits, gates: [] };
}
