"use client";

import { useState } from "react";
import { GATE_DEFS, gateDef, type GateType } from "@/lib/circuit/types";
import { makeTranslator, type Translate } from "@/lib/i18n/composer";

const defaultT = makeTranslator("en");

export interface PendingControl {
  type: GateType;
  qubit: number;
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export default function GatePalette({
  pendingControl,
  compact = false,
  t = defaultT,
}: {
  pendingControl: PendingControl | null;
  compact?: boolean;
  t?: Translate;
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
          {t("operations")}
        </p>
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1">
          <span className="text-[var(--foreground-subtle)]">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            aria-label={t("searchOperations")}
            className="w-16 bg-transparent text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)] sm:w-24"
          />
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-6 gap-1.5">
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
            className="flex aspect-square cursor-grab select-none items-center justify-center rounded-md text-xs font-semibold shadow-[var(--shadow-sm)] transition-transform active:cursor-grabbing active:scale-95"
          >
            {def.label}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-2 text-xs text-[var(--foreground-subtle)]">
            {t("noOperationMatches", { query })}
          </p>
        )}
      </div>

      {pendingControl && (
        <p className="mt-2.5 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-700 dark:text-amber-400">
          {t("controlSetOnQubit", { gate: gateDef(pendingControl.type).label, qubit: pendingControl.qubit })}
        </p>
      )}
    </div>
  );
}
