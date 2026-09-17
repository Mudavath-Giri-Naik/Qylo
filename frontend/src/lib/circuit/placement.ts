import type { CircuitJson, Gate, GateType } from "@/lib/circuit/types";

/** The next free time step on a given wire (one past the highest step already used there). */
export function nextOpenStep(gates: Gate[], qubit: number): number {
  const used = gates.filter((g) => g.qubits.includes(qubit)).map((g) => g.step);
  return used.length ? Math.max(...used) + 1 : 0;
}

export function maxStep(gates: Gate[]): number {
  return gates.length ? Math.max(...gates.map((g) => g.step)) : -1;
}

export function placeSingleQubitGate(
  circuit: CircuitJson,
  type: GateType,
  qubit: number,
  angle?: number
): CircuitJson {
  const step = nextOpenStep(circuit.gates, qubit);
  const gate: Gate = { type, qubits: [qubit], step };
  if (angle !== undefined) gate.angle = angle;
  return { ...circuit, gates: [...circuit.gates, gate] };
}

export function placeTwoQubitGate(
  circuit: CircuitJson,
  type: GateType,
  control: number,
  target: number
): CircuitJson {
  if (control === target) return circuit;
  const step = Math.max(
    nextOpenStep(circuit.gates, control),
    nextOpenStep(circuit.gates, target)
  );
  const gate: Gate = { type, qubits: [control, target], step };
  return { ...circuit, gates: [...circuit.gates, gate] };
}

export function removeGate(circuit: CircuitJson, index: number): CircuitJson {
  return { ...circuit, gates: circuit.gates.filter((_, i) => i !== index) };
}

export function updateGateAngle(circuit: CircuitJson, index: number, angle: number): CircuitJson {
  return {
    ...circuit,
    gates: circuit.gates.map((g, i) => (i === index ? { ...g, angle } : g)),
  };
}

export function setQubitCount(circuit: CircuitJson, numQubits: number): CircuitJson {
  return {
    num_qubits: numQubits,
    gates: circuit.gates.filter((g) => g.qubits.every((q) => q < numQubits)),
  };
}
