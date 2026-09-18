"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gateDef, type CircuitJson, type GateType } from "@/lib/circuit/types";
import { maxStep } from "@/lib/circuit/placement";
import type { PendingControl } from "@/components/circuit-builder/GatePalette";
import { makeTranslator, type Translate } from "@/lib/i18n/composer";

const defaultT = makeTranslator("en");

const CELL_WIDTH = 60;
const MIN_ROW_HEIGHT = 46;
const MAX_ROW_HEIGHT = 84;
const LABEL_WIDTH = 40;
const MIN_COLUMNS = 6;

function MinusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

export default function CircuitCanvas({
  circuit,
  pendingControl,
  selectedGateIndex,
  onDropGate,
  onWireClick,
  onSelectGate,
  onRemoveQubit,
  inspect = false,
  t = defaultT,
}: {
  circuit: CircuitJson;
  pendingControl: PendingControl | null;
  selectedGateIndex: number | null;
  onDropGate: (qubit: number, gateType: GateType) => void;
  onWireClick: (qubit: number) => void;
  onSelectGate: (index: number) => void;
  onRemoveQubit?: () => void;
  inspect?: boolean;
  t?: Translate;
}) {
  // The wire rows fill whatever vertical space the panel actually has,
  // rather than a fixed height that either overflows (scrollbars) or leaves
  // a gap underneath. Measured via ResizeObserver on the outer frame, since
  // gate/connector positions need a real pixel value, not just CSS flex.
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = useState(0);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setFrameHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    setFrameHeight(el.getBoundingClientRect().height);
    return () => observer.disconnect();
  }, []);

  const rows = circuit.num_qubits + 1; // +1 for the classical register row
  const rowHeight = Math.min(MAX_ROW_HEIGHT, Math.max(MIN_ROW_HEIGHT, Math.floor(frameHeight / rows)));

  const columns = Math.max(MIN_COLUMNS, maxStep(circuit.gates) + 3);
  const width = columns * CELL_WIDTH;
  const wiresHeight = circuit.num_qubits * rowHeight;
  const height = Math.max(frameHeight, wiresHeight + rowHeight);

  const twoQubitGates = circuit.gates
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => gateDef(g.type).numQubits === 2);
  const measureGates = circuit.gates
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.type === "MEASURE");

  return (
    <div
      ref={frameRef}
      className="h-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--composer-panel-2)] shadow-[var(--shadow-sm)]"
    >
      <div className="flex">
        <div className="shrink-0 border-r border-[var(--border)]" style={{ width: LABEL_WIDTH }}>
          {Array.from({ length: circuit.num_qubits }).map((_, q) => (
            <div
              key={q}
              className="flex items-center justify-center text-xs font-mono font-medium text-[var(--composer-wire-label)]"
              style={{ height: rowHeight }}
            >
              q[{q}]
            </div>
          ))}
          <div
            className="flex items-center justify-center text-xs font-mono font-medium text-[var(--composer-wire-label)]"
            style={{ height: rowHeight }}
          >
            c{circuit.num_qubits}
          </div>
        </div>

        <div className="relative flex-1" style={{ minWidth: width, height }}>
          {Array.from({ length: circuit.num_qubits }).map((_, q) => {
            const isPendingControl = pendingControl?.qubit === q;
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
                style={{ top: q * rowHeight, height: rowHeight }}
              >
                <div
                  className="absolute left-0 right-0 h-px bg-[var(--composer-wire)]"
                  style={{ top: rowHeight / 2 }}
                />
                {onRemoveQubit && (
                  <button
                    type="button"
                    aria-label={t("removeQubit")}
                    title={t("removeQubit")}
                    disabled={circuit.num_qubits <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveQubit();
                    }}
                    className="absolute flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground-muted)] transition-colors hover:border-red-500/50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
                    style={{ right: 6, top: rowHeight / 2 - 10 }}
                  >
                    <MinusIcon />
                  </button>
                )}
              </div>
            );
          })}

          {/* Classical register row */}
          <div className="absolute left-0 right-0" style={{ top: wiresHeight, height: rowHeight }}>
            <div
              className="absolute left-0 right-0 h-[3px]"
              style={{
                top: rowHeight / 2 - 2,
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
                    top: rowHeight / 2 - 8,
                    color: isSelected ? "var(--chart-series-1)" : "var(--gate-measure-solid-fg)",
                  }}
                >
                  c[{g.qubits[0]}]
                </span>
              );
            })}
          </div>

          <svg className="pointer-events-none absolute left-0 top-0" width={width} height={height}>
            {twoQubitGates.map(({ g, i }) => {
              const [control, target] = g.qubits;
              const x = g.step * CELL_WIDTH + CELL_WIDTH / 2;
              const yControl = control * rowHeight + rowHeight / 2;
              const yTarget = target * rowHeight + rowHeight / 2;
              const isSelected = selectedGateIndex === i;
              const stroke = isSelected ? "var(--chart-series-1)" : "var(--gate-x-solid)";
              return (
                <g key={i}>
                  <line x1={x} y1={yControl} x2={x} y2={yTarget} stroke={stroke} strokeWidth={2} />
                  <circle cx={x} cy={yControl} r={6} fill={stroke} />
                  {g.type === "CNOT" && (
                    <>
                      <circle cx={x} cy={yTarget} r={11} fill="none" stroke={stroke} strokeWidth={2} />
                      <line x1={x - 11} y1={yTarget} x2={x + 11} y2={yTarget} stroke={stroke} strokeWidth={2} />
                      <line x1={x} y1={yTarget - 11} x2={x} y2={yTarget + 11} stroke={stroke} strokeWidth={2} />
                    </>
                  )}
                  {g.type === "CZ" && <circle cx={x} cy={yTarget} r={6} fill={stroke} />}
                  {g.type === "CY" && (
                    <>
                      <circle cx={x} cy={yTarget} r={11} fill={stroke} />
                      <text x={x} y={yTarget + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--composer-panel-2)">
                        Y
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            {measureGates.map(({ g, i }) => {
              const x = g.step * CELL_WIDTH + CELL_WIDTH / 2;
              const y = g.qubits[0] * rowHeight + rowHeight / 2;
              const isSelected = selectedGateIndex === i;
              const stroke = isSelected ? "var(--chart-series-1)" : "var(--composer-wire)";
              return (
                <line key={i} x1={x} y1={y} x2={x} y2={wiresHeight + rowHeight / 2} stroke={stroke} strokeWidth={1.5} strokeDasharray="2 3" />
              );
            })}
          </svg>

          {circuit.gates.map((gate, i) => {
            if (gateDef(gate.type).numQubits === 2) {
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${gate.type} gate, control qubit ${gate.qubits[0]}, target qubit ${gate.qubits[1]}`}
                  title={inspect ? `${gateDef(gate.type).description} — control ${gate.qubits[0]}, target ${gate.qubits[1]}, step ${gate.step}` : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGate(i);
                  }}
                  className="absolute"
                  style={{
                    left: gate.step * CELL_WIDTH + CELL_WIDTH / 2 - 14,
                    top: Math.min(gate.qubits[0], gate.qubits[1]) * rowHeight + rowHeight / 2 - 14,
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
                  : def.label;

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
                  top: q * rowHeight + rowHeight / 2 - 18,
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
