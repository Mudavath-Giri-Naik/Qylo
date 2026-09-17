import type { CircuitJson } from "@/lib/circuit/types";

type C = [number, number];
type Mat2 = [[C, C], [C, C]];

const add = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const mul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const neg = (a: C): C => [-a[0], -a[1]];

const X_MATRIX: Mat2 = [
  [[0, 0], [1, 0]],
  [[1, 0], [0, 0]],
];
const Y_MATRIX: Mat2 = [
  [[0, 0], [0, -1]],
  [[0, 1], [0, 0]],
];

/** Single-qubit gate matrices, cross-checked against qiskit's own `Gate.to_matrix()`
 * output for every gate below (H, X, Y, Z, I, S, Sdg, T, Tdg, SX, P, RX, RY, RZ). */
function singleQubitMatrix(type: string, angle: number): Mat2 | null {
  const SQ2 = Math.SQRT1_2;
  switch (type) {
    case "H":
      return [[[SQ2, 0], [SQ2, 0]], [[SQ2, 0], [-SQ2, 0]]];
    case "X":
      return X_MATRIX;
    case "Y":
      return Y_MATRIX;
    case "Z":
      return [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]];
    case "I":
      return [[[1, 0], [0, 0]], [[0, 0], [1, 0]]];
    case "S":
      return [[[1, 0], [0, 0]], [[0, 0], [0, 1]]];
    case "SDG":
      return [[[1, 0], [0, 0]], [[0, 0], [0, -1]]];
    case "T":
      return [[[1, 0], [0, 0]], [[0, 0], [SQ2, SQ2]]];
    case "TDG":
      return [[[1, 0], [0, 0]], [[0, 0], [SQ2, -SQ2]]];
    case "SX":
      return [[[0.5, 0.5], [0.5, -0.5]], [[0.5, -0.5], [0.5, 0.5]]];
    case "P":
      return [[[1, 0], [0, 0]], [[0, 0], [Math.cos(angle), Math.sin(angle)]]];
    case "RX": {
      const c = Math.cos(angle / 2);
      const s = Math.sin(angle / 2);
      return [[[c, 0], [0, -s]], [[0, -s], [c, 0]]];
    }
    case "RY": {
      const c = Math.cos(angle / 2);
      const s = Math.sin(angle / 2);
      return [[[c, 0], [-s, 0]], [[s, 0], [c, 0]]];
    }
    case "RZ": {
      const c = Math.cos(angle / 2);
      const s = Math.sin(angle / 2);
      return [[[c, -s], [0, 0]], [[0, 0], [c, s]]];
    }
    default:
      return null;
  }
}

function applySingleQubit(amps: C[], qubit: number, matrix: Mat2) {
  const [[a, b], [c, d]] = matrix;
  const bit = 1 << qubit;
  for (let i = 0; i < amps.length; i++) {
    if ((i & bit) !== 0) continue;
    const j = i | bit;
    const amp0 = amps[i];
    const amp1 = amps[j];
    amps[i] = add(mul(a, amp0), mul(b, amp1));
    amps[j] = add(mul(c, amp0), mul(d, amp1));
  }
}

/** Matches qiskit's `Statevector` handling of a `reset` instruction: project
 * onto the qubit=0 subspace and renormalize (verified against a live qiskit
 * install — `Statevector.from_instruction` on H;CX;reset(0) yields |00>). */
function applyReset(amps: C[], qubit: number) {
  const bit = 1 << qubit;
  let norm = 0;
  for (let i = 0; i < amps.length; i++) {
    if ((i & bit) === 0) norm += amps[i][0] ** 2 + amps[i][1] ** 2;
  }
  const scale = norm > 1e-12 ? 1 / Math.sqrt(norm) : 0;
  for (let i = 0; i < amps.length; i++) {
    amps[i] = (i & bit) !== 0 ? [0, 0] : [amps[i][0] * scale, amps[i][1] * scale];
  }
}

function applyControlled(amps: C[], control: number, target: number, matrix: Mat2) {
  const [[a, b], [c, d]] = matrix;
  const controlBit = 1 << control;
  const targetBit = 1 << target;
  for (let i = 0; i < amps.length; i++) {
    if ((i & targetBit) !== 0 || (i & controlBit) === 0) continue;
    const j = i | targetBit;
    const amp0 = amps[i];
    const amp1 = amps[j];
    amps[i] = add(mul(a, amp0), mul(b, amp1));
    amps[j] = add(mul(c, amp0), mul(d, amp1));
  }
}

function applyCZ(amps: C[], control: number, target: number) {
  const controlBit = 1 << control;
  const targetBit = 1 << target;
  for (let i = 0; i < amps.length; i++) {
    if ((i & controlBit) !== 0 && (i & targetBit) !== 0) amps[i] = neg(amps[i]);
  }
}

/**
 * Client-side statevector simulation mirroring the backend's gate set exactly
 * (same matrices, same little-endian qubit indexing as qiskit), so the live
 * preview needs no network round-trip. MEASURE gates are skipped, matching
 * how the backend builds its unitary-only statevector circuit.
 */
export function simulateStatevector(circuit: CircuitJson): [number, number][] {
  const n = circuit.num_qubits;
  const size = 1 << n;
  const amps: C[] = Array.from({ length: size }, (_, i) => (i === 0 ? [1, 0] : [0, 0]));

  const sorted = [...circuit.gates].sort((a, b) => a.step - b.step);
  for (const gate of sorted) {
    if (gate.type === "MEASURE") continue;
    if (gate.type === "RESET") {
      applyReset(amps, gate.qubits[0]);
      continue;
    }
    if (gate.type === "CNOT") {
      applyControlled(amps, gate.qubits[0], gate.qubits[1], X_MATRIX);
      continue;
    }
    if (gate.type === "CY") {
      applyControlled(amps, gate.qubits[0], gate.qubits[1], Y_MATRIX);
      continue;
    }
    if (gate.type === "CZ") {
      applyCZ(amps, gate.qubits[0], gate.qubits[1]);
      continue;
    }
    const matrix = singleQubitMatrix(gate.type, gate.angle ?? 0);
    if (matrix) applySingleQubit(amps, gate.qubits[0], matrix);
  }

  return amps;
}

/** Bloch vector for a single-qubit statevector, same formula the backend uses. */
export function blochVectorFromStatevector(statevector: [number, number][]): [number, number, number] {
  const [are, aim] = statevector[0];
  const [bre, bim] = statevector[1];
  // <a|b> = conj(a) * b
  const dotRe = are * bre + aim * bim;
  const dotIm = are * bim - aim * bre;
  return [2 * dotRe, 2 * dotIm, are * are + aim * aim - (bre * bre + bim * bim)];
}

/** Exact Born-rule probabilities per basis state, keyed the same way the
 * backend's `counts` are (binary string, qubit n-1 first). Feeds the
 * Probabilities panel instantly, before any network run completes. */
export function probabilitiesFromStatevector(
  statevector: [number, number][],
  numQubits: number
): Record<string, number> {
  const probs: Record<string, number> = {};
  statevector.forEach(([re, im], i) => {
    const p = re * re + im * im;
    if (p < 1e-9) return;
    probs[i.toString(2).padStart(numQubits, "0")] = p;
  });
  return probs;
}
