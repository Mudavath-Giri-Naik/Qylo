"use client";

import { GATE_DEFS, type GateType } from "@/lib/circuit/types";

export default function GatePalette({
  pendingCnotControl,
}: {
  pendingCnotControl: number | null;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
        Operations
      </p>
      <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-11">
        {GATE_DEFS.map((def) => (
          <div
            key={def.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", def.type satisfies GateType);
              e.dataTransfer.effectAllowed = "copy";
            }}
            title={def.description}
            style={{ backgroundColor: `color-mix(in srgb, var(${def.colorVar}) 14%, transparent)` }}
            className="flex aspect-square cursor-grab select-none items-center justify-center rounded-lg border border-[var(--border)] text-sm font-semibold transition-transform active:cursor-grabbing active:scale-95"
          >
            <span style={{ color: `var(${def.colorVar})` }}>{def.label}</span>
          </div>
        ))}
      </div>

      {pendingCnotControl !== null && (
        <p className="mt-3 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-700 dark:text-amber-400">
          CNOT control set on qubit {pendingCnotControl} — click another wire to set the
          target.
        </p>
      )}
      <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
        Drag a gate onto a wire. CNOT: drop on the control wire, then click the target
        wire. Click a placed gate to remove it or edit its angle.
      </p>
    </div>
  );
}
