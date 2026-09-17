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
}

export const GATE_DEFS: GateDef[] = [
  { type: "H", label: "H", numQubits: 1, hasAngle: false, description: "Hadamard" },
  { type: "X", label: "X", numQubits: 1, hasAngle: false, description: "Pauli-X (NOT)" },
  { type: "Y", label: "Y", numQubits: 1, hasAngle: false, description: "Pauli-Y" },
  { type: "Z", label: "Z", numQubits: 1, hasAngle: false, description: "Pauli-Z" },
  { type: "S", label: "S", numQubits: 1, hasAngle: false, description: "S (phase)" },
  { type: "T", label: "T", numQubits: 1, hasAngle: false, description: "T (π/8 phase)" },
  { type: "RX", label: "RX", numQubits: 1, hasAngle: true, description: "Rotate X" },
  { type: "RY", label: "RY", numQubits: 1, hasAngle: true, description: "Rotate Y" },
  { type: "RZ", label: "RZ", numQubits: 1, hasAngle: true, description: "Rotate Z" },
  { type: "CNOT", label: "CNOT", numQubits: 2, hasAngle: false, description: "Controlled-NOT" },
  { type: "MEASURE", label: "M", numQubits: 1, hasAngle: false, description: "Measure" },
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
