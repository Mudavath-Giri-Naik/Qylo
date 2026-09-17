export type GateType =
  | "H"
  | "X"
  | "Y"
  | "Z"
  | "S"
  | "SDG"
  | "T"
  | "TDG"
  | "SX"
  | "I"
  | "P"
  | "RX"
  | "RY"
  | "RZ"
  | "RESET"
  | "CNOT"
  | "CZ"
  | "CY"
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
  /** CSS custom property (defined in globals.css) for the solid IBM Composer-style fill. */
  solidVar: string;
  /** Foreground color to pair with the solid fill. */
  solidFg: "light" | "dark";
}

export const GATE_DEFS: GateDef[] = [
  { type: "H", label: "H", numQubits: 1, hasAngle: false, description: "Hadamard", solidVar: "--gate-h-solid", solidFg: "light" },
  { type: "I", label: "I", numQubits: 1, hasAngle: false, description: "Identity", solidVar: "--gate-x-solid", solidFg: "light" },
  { type: "CNOT", label: "CNOT", numQubits: 2, hasAngle: false, description: "Controlled-NOT", solidVar: "--gate-x-solid", solidFg: "light" },
  { type: "CZ", label: "CZ", numQubits: 2, hasAngle: false, description: "Controlled-Z", solidVar: "--gate-x-solid", solidFg: "light" },
  { type: "CY", label: "CY", numQubits: 2, hasAngle: false, description: "Controlled-Y", solidVar: "--gate-x-solid", solidFg: "light" },
  { type: "X", label: "X", numQubits: 1, hasAngle: false, description: "Pauli-X (NOT)", solidVar: "--gate-x-solid", solidFg: "light" },
  { type: "S", label: "S", numQubits: 1, hasAngle: false, description: "S (phase)", solidVar: "--gate-phase-solid", solidFg: "light" },
  { type: "SDG", label: "S†", numQubits: 1, hasAngle: false, description: "S-dagger (inverse phase)", solidVar: "--gate-phase-solid", solidFg: "light" },
  { type: "T", label: "T", numQubits: 1, hasAngle: false, description: "T (π/8 phase)", solidVar: "--gate-phase-solid", solidFg: "light" },
  { type: "TDG", label: "T†", numQubits: 1, hasAngle: false, description: "T-dagger (inverse π/8 phase)", solidVar: "--gate-phase-solid", solidFg: "light" },
  { type: "P", label: "P", numQubits: 1, hasAngle: true, description: "Phase(λ)", solidVar: "--gate-phase-solid", solidFg: "light" },
  { type: "RZ", label: "RZ", numQubits: 1, hasAngle: true, description: "Rotate Z", solidVar: "--gate-phase-solid", solidFg: "light" },
  { type: "Z", label: "Z", numQubits: 1, hasAngle: false, description: "Pauli-Z", solidVar: "--gate-phase-solid", solidFg: "light" },
  { type: "RESET", label: "|0⟩", numQubits: 1, hasAngle: false, description: "Reset to |0⟩", solidVar: "--gate-measure-solid", solidFg: "dark" },
  { type: "SX", label: "√X", numQubits: 1, hasAngle: false, description: "Square-root of X", solidVar: "--gate-rotation-solid", solidFg: "light" },
  { type: "Y", label: "Y", numQubits: 1, hasAngle: false, description: "Pauli-Y", solidVar: "--gate-rotation-solid", solidFg: "light" },
  { type: "RX", label: "RX", numQubits: 1, hasAngle: true, description: "Rotate X", solidVar: "--gate-rotation-solid", solidFg: "light" },
  { type: "RY", label: "RY", numQubits: 1, hasAngle: true, description: "Rotate Y", solidVar: "--gate-rotation-solid", solidFg: "light" },
  { type: "MEASURE", label: "M", numQubits: 1, hasAngle: false, description: "Measure", solidVar: "--gate-measure-solid", solidFg: "dark" },
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
