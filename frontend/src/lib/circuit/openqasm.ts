import type { CircuitJson, Gate, GateType } from "@/lib/circuit/types";
import { nextOpenStep } from "@/lib/circuit/placement";
import type { ParseResult } from "@/lib/circuit/codeparse";

const SINGLE_QUBIT_OPS: Record<string, GateType> = {
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
};
const ROTATION_OPS: Record<string, GateType> = { rx: "RX", ry: "RY", rz: "RZ", p: "P" };
const TWO_QUBIT_OPS: Record<string, GateType> = { cx: "CNOT", cz: "CZ", cy: "CY" };

function formatAngleQasm(angle: number | undefined): string {
  if (angle === undefined) return "0.0";
  const piFractions: [number, string][] = [
    [Math.PI / 4, "pi/4"],
    [Math.PI / 2, "pi/2"],
    [Math.PI, "pi"],
    [(3 * Math.PI) / 2, "3*pi/2"],
    [-Math.PI / 2, "-pi/2"],
    [-Math.PI / 4, "-pi/4"],
  ];
  const match = piFractions.find(([v]) => Math.abs(v - angle) < 1e-9);
  return match ? match[1] : angle.toFixed(4);
}

function lineFor(gate: Gate): string {
  const [q0, q1] = gate.qubits;
  switch (gate.type) {
    case "H":
      return `h q[${q0}];`;
    case "X":
      return `x q[${q0}];`;
    case "Y":
      return `y q[${q0}];`;
    case "Z":
      return `z q[${q0}];`;
    case "I":
      return `id q[${q0}];`;
    case "S":
      return `s q[${q0}];`;
    case "SDG":
      return `sdg q[${q0}];`;
    case "T":
      return `t q[${q0}];`;
    case "TDG":
      return `tdg q[${q0}];`;
    case "SX":
      return `sx q[${q0}];`;
    case "P":
      return `p(${formatAngleQasm(gate.angle)}) q[${q0}];`;
    case "RX":
      return `rx(${formatAngleQasm(gate.angle)}) q[${q0}];`;
    case "RY":
      return `ry(${formatAngleQasm(gate.angle)}) q[${q0}];`;
    case "RZ":
      return `rz(${formatAngleQasm(gate.angle)}) q[${q0}];`;
    case "RESET":
      return `reset q[${q0}];`;
    case "CNOT":
      return `cx q[${q0}], q[${q1}];`;
    case "CZ":
      return `cz q[${q0}], q[${q1}];`;
    case "CY":
      return `cy q[${q0}], q[${q1}];`;
    case "MEASURE":
      return `measure q[${q0}] -> c[${q0}];`;
    default:
      return `// unknown gate ${gate.type}`;
  }
}

export function generateOpenQasm(circuit: CircuitJson): string {
  const sorted = [...circuit.gates].sort((a, b) => a.step - b.step);
  const body = sorted.map((g) => lineFor(g)).join("\n");

  const lines = [
    "OPENQASM 3.0;",
    'include "stdgates.inc";',
    "",
    `qubit[${circuit.num_qubits}] q;`,
    `bit[${circuit.num_qubits}] c;`,
    ...(body ? ["", body] : []),
  ];

  return lines.join("\n");
}

function parseQasmAngle(expr: string): number | null {
  const cleaned = expr.trim();
  const piMatch = cleaned.match(
    /^(-?)\s*(?:(\d+(?:\.\d+)?)\s*\*\s*)?pi\s*(?:\/\s*(\d+(?:\.\d+)?))?$/
  );
  if (piMatch) {
    const sign = piMatch[1] === "-" ? -1 : 1;
    const numerator = piMatch[2] ? parseFloat(piMatch[2]) : 1;
    const denominator = piMatch[3] ? parseFloat(piMatch[3]) : 1;
    return (sign * numerator * Math.PI) / denominator;
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * A deliberately narrow, regex-based parser for the exact OpenQASM 3 lines this
 * app generates (h q[0];, cx q[0], q[1];, rz(pi/2) q[0];, measure q[0] -> c[0];,
 * reset q[0];). Never evaluates or executes the source text.
 */
export function parseOpenQasm(code: string): ParseResult {
  const qubitCountMatch = code.match(/qubit\s*\[\s*(\d+)\s*\]/);
  if (!qubitCountMatch) {
    return { error: "Couldn't find `qubit[n] q;` to determine qubit count." };
  }
  const numQubits = parseInt(qubitCountMatch[1], 10);
  if (!(numQubits >= 1 && numQubits <= 5)) {
    return { error: "Qubit count must be between 1 and 5." };
  }

  const gates: Gate[] = [];
  const lines = code.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim().replace(/;\s*$/, "");
    if (
      !line ||
      line.startsWith("//") ||
      line.startsWith("OPENQASM") ||
      line.startsWith("include") ||
      line.startsWith("qubit") ||
      line.startsWith("bit")
    ) {
      continue;
    }

    const measureMatch = line.match(/^measure\s+q\s*\[\s*(\d+)\s*\]\s*->\s*c\s*\[\s*(\d+)\s*\]$/);
    if (measureMatch) {
      const q = parseInt(measureMatch[1], 10);
      gates.push({ type: "MEASURE", qubits: [q], step: nextOpenStep(gates, q) });
      continue;
    }

    const resetMatch = line.match(/^reset\s+q\s*\[\s*(\d+)\s*\]$/);
    if (resetMatch) {
      const q = parseInt(resetMatch[1], 10);
      gates.push({ type: "RESET", qubits: [q], step: nextOpenStep(gates, q) });
      continue;
    }

    const twoQubitMatch = line.match(/^(cx|cz|cy)\s+q\s*\[\s*(\d+)\s*\]\s*,\s*q\s*\[\s*(\d+)\s*\]$/);
    if (twoQubitMatch) {
      const [, op, controlStr, targetStr] = twoQubitMatch;
      const control = parseInt(controlStr, 10);
      const target = parseInt(targetStr, 10);
      gates.push({
        type: TWO_QUBIT_OPS[op],
        qubits: [control, target],
        step: Math.max(nextOpenStep(gates, control), nextOpenStep(gates, target)),
      });
      continue;
    }

    const rotationMatch = line.match(/^(rx|ry|rz|p)\s*\(([^)]*)\)\s+q\s*\[\s*(\d+)\s*\]$/);
    if (rotationMatch) {
      const [, op, angleExpr, qStr] = rotationMatch;
      const angle = parseQasmAngle(angleExpr);
      const q = parseInt(qStr, 10);
      if (angle === null) return { error: `Couldn't parse rotation angle in: "${line}"` };
      gates.push({ type: ROTATION_OPS[op], qubits: [q], step: nextOpenStep(gates, q), angle });
      continue;
    }

    const singleMatch = line.match(/^(h|x|y|z|id|sdg|s|tdg|t|sx)\s+q\s*\[\s*(\d+)\s*\]$/);
    if (singleMatch) {
      const [, op, qStr] = singleMatch;
      const q = parseInt(qStr, 10);
      gates.push({ type: SINGLE_QUBIT_OPS[op], qubits: [q], step: nextOpenStep(gates, q) });
      continue;
    }

    return { error: `Couldn't parse line: "${line}"` };
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
