"use client";

import { gateDef, type CircuitJson, type GateType } from "@/lib/circuit/types";
import { maxStep } from "@/lib/circuit/placement";

const CELL_WIDTH = 64;
const ROW_HEIGHT = 56;
const LABEL_WIDTH = 40;

export default function CircuitCanvas({
  circuit,
  pendingCnotControl,
  selectedGateIndex,
  onDropGate,
  onWireClick,
  onSelectGate,
}: {
  circuit: CircuitJson;
  pendingCnotControl: number | null;
  selectedGateIndex: number | null;
  onDropGate: (qubit: number, gateType: GateType) => void;
  onWireClick: (qubit: number) => void;
  onSelectGate: (index: number) => void;
}) {
  const columns = Math.max(4, maxStep(circuit.gates) + 3);
  const width = columns * CELL_WIDTH;
  const height = circuit.num_qubits * ROW_HEIGHT;

  const cnotGates = circuit.gates
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.type === "CNOT");

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)]">
      <div className="flex">
        <div className="shrink-0 border-r border-[var(--border)]" style={{ width: LABEL_WIDTH }}>
          {Array.from({ length: circuit.num_qubits }).map((_, q) => (
            <div
              key={q}
              className="flex items-center justify-center text-xs font-mono font-medium text-[var(--foreground-muted)]"
              style={{ height: ROW_HEIGHT }}
            >
              q{q}
            </div>
          ))}
        </div>

        <div className="relative" style={{ width, height }}>
          {Array.from({ length: circuit.num_qubits }).map((_, q) => {
            const isPendingControl = pendingCnotControl === q;
            return (
              <div
                key={q}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const gateType = e.dataTransfer.getData("text/plain") as GateType;
                  if (gateType) onDropGate(q, gateType);
                }}
                onClick={() => onWireClick(q)}
                className={`absolute left-0 right-0 cursor-pointer transition-colors ${
                  isPendingControl ? "bg-amber-500/10" : ""
                }`}
                style={{ top: q * ROW_HEIGHT, height: ROW_HEIGHT }}
              >
                <div
                  className="absolute left-0 right-0 h-px bg-[var(--border-strong)]"
                  style={{ top: ROW_HEIGHT / 2 }}
                />
              </div>
            );
          })}

          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            {cnotGates.map(({ g, i }) => {
              const [control, target] = g.qubits;
              const x = g.step * CELL_WIDTH + CELL_WIDTH / 2;
              const yControl = control * ROW_HEIGHT + ROW_HEIGHT / 2;
              const yTarget = target * ROW_HEIGHT + ROW_HEIGHT / 2;
              const isSelected = selectedGateIndex === i;
              const stroke = isSelected ? "var(--chart-series-1)" : "var(--gate-two-qubit)";
              return (
                <g key={i}>
                  <line x1={x} y1={yControl} x2={x} y2={yTarget} stroke={stroke} strokeWidth={2} />
                  <circle cx={x} cy={yControl} r={6} fill={stroke} />
                  <circle cx={x} cy={yTarget} r={11} fill="none" stroke={stroke} strokeWidth={2} />
                  <line x1={x - 11} y1={yTarget} x2={x + 11} y2={yTarget} stroke={stroke} strokeWidth={2} />
                  <line x1={x} y1={yTarget - 11} x2={x} y2={yTarget + 11} stroke={stroke} strokeWidth={2} />
                </g>
              );
            })}
          </svg>

          {circuit.gates.map((gate, i) => {
            if (gate.type === "CNOT") {
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`CNOT gate, control qubit ${gate.qubits[0]}, target qubit ${gate.qubits[1]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGate(i);
                  }}
                  className="absolute"
                  style={{
                    left: gate.step * CELL_WIDTH + CELL_WIDTH / 2 - 14,
                    top: Math.min(gate.qubits[0], gate.qubits[1]) * ROW_HEIGHT + ROW_HEIGHT / 2 - 14,
                    width: 28,
                    height: 28,
                  }}
                />
              );
            }

            const q = gate.qubits[0];
            const isSelected = selectedGateIndex === i;
            const colorVar = gateDef(gate.type).colorVar;
            const label =
              gate.angle !== undefined
                ? `${gate.type}\n${Math.round((gate.angle * 180) / Math.PI)}°`
                : gate.type === "MEASURE"
                  ? "M"
                  : gate.type;

            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGate(i);
                }}
                className="absolute flex flex-col items-center justify-center whitespace-pre-line rounded-lg border text-[11px] font-semibold leading-tight shadow-[var(--shadow-sm)] transition-transform hover:scale-[1.04]"
                style={{
                  left: gate.step * CELL_WIDTH + CELL_WIDTH / 2 - 20,
                  top: q * ROW_HEIGHT + ROW_HEIGHT / 2 - 18,
                  width: 40,
                  height: 36,
                  color: `var(${colorVar})`,
                  borderColor: isSelected ? "var(--chart-series-1)" : `var(${colorVar})`,
                  backgroundColor: isSelected
                    ? "color-mix(in srgb, var(--chart-series-1) 18%, var(--surface))"
                    : `color-mix(in srgb, var(${colorVar}) 14%, var(--surface))`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
