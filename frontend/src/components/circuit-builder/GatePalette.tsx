"use client";

import { GATE_DEFS, type GateType } from "@/lib/circuit/types";

export default function GatePalette({
  pendingCnotControl,
}: {
  pendingCnotControl: number | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
        Gates
      </p>
      <div className="flex flex-wrap gap-2">
        {GATE_DEFS.map((def) => (
          <div
            key={def.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", def.type satisfies GateType);
              e.dataTransfer.effectAllowed = "copy";
            }}
            title={def.description}
            className="flex h-11 w-14 cursor-grab select-none items-center justify-center rounded-md border border-black/10 bg-black/[0.02] text-sm font-semibold active:cursor-grabbing dark:border-white/15 dark:bg-white/[0.03]"
          >
            {def.label}
          </div>
        ))}
      </div>
      {pendingCnotControl !== null && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          CNOT control set on qubit {pendingCnotControl} — click another wire to set the
          target.
        </p>
      )}
      <p className="text-xs text-foreground/50">
        Drag a gate onto a wire. CNOT: drop on the control wire, then click the target
        wire. Click a placed gate to remove it or edit its angle.
      </p>
    </div>
  );
}
