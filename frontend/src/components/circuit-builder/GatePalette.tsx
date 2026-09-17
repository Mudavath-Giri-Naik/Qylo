"use client";

import { useState } from "react";
import { GATE_DEFS, type GateType } from "@/lib/circuit/types";

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export default function GatePalette({
  pendingCnotControl,
  compact = false,
}: {
  pendingCnotControl: number | null;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = GATE_DEFS.filter(
    (def) =>
      !query ||
      def.label.toLowerCase().includes(query.toLowerCase()) ||
      def.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={compact ? "" : "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
          Operations
        </p>
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1">
          <span className="text-[var(--foreground-subtle)]">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search operations"
            className="w-16 bg-transparent text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)] sm:w-24"
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-6 xl:grid-cols-7">
        {filtered.map((def) => (
          <div
            key={def.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", def.type satisfies GateType);
              e.dataTransfer.effectAllowed = "copy";
            }}
            title={def.description}
            style={{
              backgroundColor: `var(${def.solidVar})`,
              color: def.solidFg === "light" ? "#ffffff" : "var(--gate-measure-solid-fg)",
            }}
            className="flex aspect-square cursor-grab select-none items-center justify-center rounded-md text-sm font-semibold shadow-[var(--shadow-sm)] transition-transform active:cursor-grabbing active:scale-95"
          >
            {def.label}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-2 text-xs text-[var(--foreground-subtle)]">
            No operation matches &quot;{query}&quot;.
          </p>
        )}
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
