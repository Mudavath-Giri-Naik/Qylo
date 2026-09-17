"use client";

import { gateDef, type CircuitJson, type GateType } from "@/lib/circuit/types";
import { maxStep } from "@/lib/circuit/placement";

const CELL_WIDTH = 64;
const ROW_HEIGHT = 56;
const LABEL_WIDTH = 44;

function MinusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

export default function CircuitCanvas({
  circuit,
  pendingCnotControl,
  selectedGateIndex,
  onDropGate,
  onWireClick,
  onSelectGate,
  onRemoveQubit,
  inspect = false,
}: {
  circuit: CircuitJson;
  pendingCnotControl: number | null;
  selectedGateIndex: number | null;
  onDropGate: (qubit: number, gateType: GateType) => void;
  onWireClick: (qubit: number) => void;
  onSelectGate: (index: number) => void;
  onRemoveQubit?: () => void;
  inspect?: boolean;
}) {
  const columns = Math.max(4, maxStep(circuit.gates) + 3);
  const width = columns * CELL_WIDTH;
  const wiresHeight = circuit.num_qubits * ROW_HEIGHT;
  const height = wiresHeight + ROW_HEIGHT;

  const cnotGates = circuit.gates
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.type === "CNOT");
  const measureGates = circuit.gates
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.type === "MEASURE");

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--composer-panel-2)] shadow-[var(--shadow-sm)]">
      <div className="flex">
        <div className="shrink-0 border-r border-[var(--border)]" style={{ width: LABEL_WIDTH }}>
          {Array.from({ length: circuit.num_qubits }).map((_, q) => (
            <div
              key={q}
              className="flex items-center justify-center text-xs font-mono font-medium text-[var(--composer-wire-label)]"
              style={{ height: ROW_HEIGHT }}
            >
              q[{q}]
            </div>
          ))}
          <div
            className="flex items-center justify-center text-xs font-mono font-medium text-[var(--composer-wire-label)]"
            style={{ height: ROW_HEIGHT }}
          >
            c{circuit.num_qubits}
          </div>
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
                  className="absolute left-0 right-0 h-px bg-[var(--composer-wire)]"
                  style={{ top: ROW_HEIGHT / 2 }}
                />
                {onRemoveQubit && (
                  <button
                    type="button"
                    aria-label={`Remove a qubit (currently ${circuit.num_qubits})`}
                    title="Remove a qubit"
                    disabled={circuit.num_qubits <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveQubit();
                    }}
                    className="absolute flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground-muted)] transition-colors hover:border-red-500/50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
                    style={{ right: -10, top: ROW_HEIGHT / 2 - 10 }}
                  >
                    <MinusIcon />
                  </button>
                )}
              </div>
            );
          })}

          {/* Classical register row */}
          <div className="absolute left-0 right-0" style={{ top: wiresHeight, height: ROW_HEIGHT }}>
            <div
              className="absolute left-0 right-0 h-[3px]"
              style={{
                top: ROW_HEIGHT / 2 - 2,
                background:
                  "repeating-linear-gradient(to bottom, var(--composer-wire) 0, var(--composer-wire) 2px, transparent 2px, transparent 5px)",
              }}
            />
            {measureGates.map(({ g, i }) => {
              const x = g.step * CELL_WIDTH + CELL_WIDTH / 2;
              const isSelected = selectedGateIndex === i;
              return (
                <span
                  key={i}
                  className="absolute -translate-x-1/2 font-mono text-[10px] font-semibold"
                  style={{
                    left: x,
                    top: ROW_HEIGHT / 2 - 8,
                    color: isSelected ? "var(--chart-series-1)" : "var(--gate-measure-solid-fg)",
                  }}
                >
                  c[{g.qubits[0]}]
                </span>
              );
            })}
          </div>

          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            {cnotGates.map(({ g, i }) => {
              const [control, target] = g.qubits;
              const x = g.step * CELL_WIDTH + CELL_WIDTH / 2;
              const yControl = control * ROW_HEIGHT + ROW_HEIGHT / 2;
              const yTarget = target * ROW_HEIGHT + ROW_HEIGHT / 2;
              const isSelected = selectedGateIndex === i;
              const stroke = isSelected ? "var(--chart-series-1)" : "var(--gate-x-solid)";
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
            {measureGates.map(({ g, i }) => {
              const x = g.step * CELL_WIDTH + CELL_WIDTH / 2;
              const y = g.qubits[0] * ROW_HEIGHT + ROW_HEIGHT / 2;
              const isSelected = selectedGateIndex === i;
              const stroke = isSelected ? "var(--chart-series-1)" : "var(--composer-wire)";
              return (
                <line key={i} x1={x} y1={y} x2={x} y2={wiresHeight + ROW_HEIGHT / 2} stroke={stroke} strokeWidth={1.5} strokeDasharray="2 3" />
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
            const def = gateDef(gate.type);
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
                title={inspect ? `${def.description} — qubit ${q}, step ${gate.step}` : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGate(i);
                }}
                className="absolute flex flex-col items-center justify-center whitespace-pre-line rounded-md text-[11px] font-semibold leading-tight shadow-[var(--shadow-sm)] transition-transform hover:scale-[1.04]"
                style={{
                  left: gate.step * CELL_WIDTH + CELL_WIDTH / 2 - 20,
                  top: q * ROW_HEIGHT + ROW_HEIGHT / 2 - 18,
                  width: 40,
                  height: 36,
                  color: def.solidFg === "light" ? "#ffffff" : "var(--gate-measure-solid-fg)",
                  outline: isSelected ? "2px solid var(--chart-series-1)" : "none",
                  outlineOffset: 1,
                  backgroundColor: `var(${def.solidVar})`,
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
