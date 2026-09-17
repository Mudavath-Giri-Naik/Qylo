"use client";

import { useState } from "react";
import { generateQiskitCode } from "@/lib/circuit/codegen";
import { parseQiskitCode } from "@/lib/circuit/codeparse";
import type { CircuitJson } from "@/lib/circuit/types";

export default function CodeView({
  circuit,
  onApplyCircuit,
}: {
  circuit: CircuitJson;
  onApplyCircuit: (circuit: CircuitJson) => void;
}) {
  const generated = generateQiskitCode(circuit);
  const [draft, setDraft] = useState(generated);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  function handleApply() {
    const result = parseQiskitCode(draft);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setEditing(false);
    onApplyCircuit(result.circuit!);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
          Qiskit code
        </p>
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

      <textarea
        value={editing ? draft : generated}
        onChange={(e) => setDraft(e.target.value)}
        readOnly={!editing}
        spellCheck={false}
        rows={Math.max(8, generated.split("\n").length + 1)}
        className={`thin-scrollbar w-full resize-y bg-[var(--surface-2)] p-4 font-mono text-xs text-[var(--foreground)] outline-none ${
          editing ? "ring-1 ring-inset ring-[var(--accent)]" : ""
        }`}
      />
      {error && (
        <p className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!editing && (
        <p className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--foreground-subtle)]">
          Generated live from the canvas. Click &quot;Edit code&quot; to write Qiskit
          calls directly and apply them back to the canvas.
        </p>
      )}
    </div>
  );
}
