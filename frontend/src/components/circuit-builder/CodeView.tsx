"use client";

import { useState } from "react";
import { generateQiskitCode } from "@/lib/circuit/codegen";
import { parseQiskitCode } from "@/lib/circuit/codeparse";
import { generateOpenQasm, parseOpenQasm } from "@/lib/circuit/openqasm";
import type { CircuitJson } from "@/lib/circuit/types";

type Format = "openqasm" | "qiskit";

function ChevronIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function CodeView({
  circuit,
  onApplyCircuit,
  compact = false,
}: {
  circuit: CircuitJson;
  onApplyCircuit: (circuit: CircuitJson) => void;
  compact?: boolean;
}) {
  const [format, setFormat] = useState<Format>("openqasm");
  const generated = format === "openqasm" ? generateOpenQasm(circuit) : generateQiskitCode(circuit);
  const [draft, setDraft] = useState(generated);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  function handleFormatChange(next: Format) {
    setFormat(next);
    setEditing(false);
    setError(null);
  }

  function handleApply() {
    const result = format === "openqasm" ? parseOpenQasm(draft) : parseQiskitCode(draft);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setEditing(false);
    onApplyCircuit(result.circuit!);
  }

  const displayed = editing ? draft : generated;
  const lineCount = displayed.split("\n").length;

  return (
    <div className={compact ? "flex h-full flex-col overflow-hidden" : "overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-sm)]"}>
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--composer-panel)] px-3 py-2.5">
        <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
          <select
            value={format}
            onChange={(e) => handleFormatChange(e.target.value as Format)}
            aria-label="Code format"
            className="cursor-pointer appearance-none bg-transparent pr-1 uppercase tracking-wide text-[var(--foreground)] outline-none"
          >
            <option value="openqasm">OpenQASM</option>
            <option value="qiskit">Qiskit</option>
          </select>
          <ChevronIcon />
        </label>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-foreground)]"
            >
              Apply to canvas
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
                setDraft(generated);
              }}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(generated);
              setEditing(true);
            }}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          >
            Edit code
          </button>
        )}
      </div>

      <div className={`flex bg-[var(--composer-panel-2)] ${compact ? "flex-1 overflow-auto" : ""}`}>
        <pre
          aria-hidden
          className="thin-scrollbar select-none overflow-hidden py-4 pl-3 pr-2 text-right font-mono text-xs leading-5 text-[var(--foreground-subtle)]"
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
        </pre>
        <textarea
          value={displayed}
          onChange={(e) => setDraft(e.target.value)}
          readOnly={!editing}
          spellCheck={false}
          rows={Math.max(8, lineCount + 1)}
          className={`w-full resize-none overflow-hidden bg-transparent py-4 pl-1 pr-4 font-mono text-xs leading-5 text-[var(--foreground)] outline-none ${
            editing ? "ring-1 ring-inset ring-[var(--accent)]" : ""
          }`}
        />
      </div>
      {error && (
        <p className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
