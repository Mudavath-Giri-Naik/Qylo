import type { CircuitJson, Gate, GateType } from "@/lib/circuit/types";
import { nextOpenStep } from "@/lib/circuit/placement";

export interface ParseResult {
  circuit?: CircuitJson;
  error?: string;
}

const SINGLE_QUBIT_METHODS: Record<string, GateType> = {
  h: "H",
  x: "X",
  y: "Y",
  z: "Z",
  id: "I",
  s: "S",
  sdg: "SDG",
  t: "T",
  tdg: "TDG",
  sx: "SX",
  reset: "RESET",
};
const ROTATION_METHODS: Record<string, GateType> = { rx: "RX", ry: "RY", rz: "RZ", p: "P" };
const TWO_QUBIT_METHODS: Record<string, GateType> = { cx: "CNOT", cz: "CZ", cy: "CY" };

/** Parses angle expressions our own generator emits, e.g. "np.pi / 2", "-np.pi", "1.5708". */
function parseAngle(expr: string): number | null {
  const cleaned = expr.trim();
  const piMatch = cleaned.match(
    /^(-?)\s*(?:(\d+(?:\.\d+)?)\s*\*\s*)?np\.pi\s*(?:\/\s*(\d+(?:\.\d+)?))?$/
  );
  if (piMatch) {
    const sign = piMatch[1] === "-" ? -1 : 1;
    const numerator = piMatch[2] ? parseFloat(piMatch[2]) : 1;
    const denominator = piMatch[3] ? parseFloat(piMatch[3]) : 1;
    return sign * numerator * Math.PI / denominator;
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * A deliberately narrow, regex-based parser for the exact Qiskit-style lines this
 * app generates (qc.h(0), qc.cx(0,1), qc.rx(np.pi/2, 0), qc.measure(0,0), and the
 * QuantumCircuit(n, n) constructor). Never evaluates or executes the source text.
 */
export function parseQiskitCode(code: string): ParseResult {
  const qubitCountMatch = code.match(/QuantumCircuit\s*\(\s*(\d+)/);
  if (!qubitCountMatch) {
    return { error: "Couldn't find `QuantumCircuit(n, n)` to determine qubit count." };
  }
  const numQubits = parseInt(qubitCountMatch[1], 10);
  if (!(numQubits >= 1 && numQubits <= 5)) {
    return { error: "Qubit count must be between 1 and 5." };
  }

  const gates: Gate[] = [];
  const lines = code.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (
      !line ||
      line.startsWith("#") ||
      line.startsWith("import") ||
      line.startsWith("from ") ||
      line.startsWith("qc =")
    ) {
      continue;
    }

    const call = line.match(/^qc\.(\w+)\s*\((.*)\)\s*$/);
    if (!call) {
      return { error: `Couldn't parse line: "${line}"` };
    }
    const [, method, argsRaw] = call;
    const args = argsRaw.split(",").map((a) => a.trim()).filter((a) => a.length > 0);

    if (method in SINGLE_QUBIT_METHODS) {
      const q = parseInt(args[0], 10);
      if (Number.isNaN(q)) return { error: `Bad qubit index in: "${line}"` };
      gates.push({
        type: SINGLE_QUBIT_METHODS[method],
        qubits: [q],
        step: nextOpenStep(gates, q),
      });
    } else if (method in ROTATION_METHODS) {
      const angle = parseAngle(args[0]);
      const q = parseInt(args[1], 10);
      if (angle === null || Number.isNaN(q)) {
        return { error: `Couldn't parse rotation gate: "${line}"` };
      }
      gates.push({
        type: ROTATION_METHODS[method],
        qubits: [q],
        step: nextOpenStep(gates, q),
        angle,
      });
    } else if (method in TWO_QUBIT_METHODS) {
      const control = parseInt(args[0], 10);
      const target = parseInt(args[1], 10);
      if (Number.isNaN(control) || Number.isNaN(target)) {
        return { error: `Bad qubit indices in: "${line}"` };
      }
      gates.push({
        type: TWO_QUBIT_METHODS[method],
        qubits: [control, target],
        step: Math.max(nextOpenStep(gates, control), nextOpenStep(gates, target)),
      });
    } else if (method === "measure") {
      const q = parseInt(args[0], 10);
      if (Number.isNaN(q)) return { error: `Bad qubit index in: "${line}"` };
      gates.push({ type: "MEASURE", qubits: [q], step: nextOpenStep(gates, q) });
    } else {
      return { error: `Unsupported instruction "qc.${method}(...)" in: "${line}"` };
    }
  }

  for (const gate of gates) {
    for (const q of gate.qubits) {
      if (q < 0 || q >= numQubits) {
        return { error: `Gate references qubit ${q}, out of range for ${numQubits} qubits.` };
      }
    }
  }

  return { circuit: { num_qubits: numQubits, gates } };
}
