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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
          Qiskit code
        </p>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background"
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
              className="rounded-md border border-black/10 px-2.5 py-1 text-xs dark:border-white/15"
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
            className="rounded-md border border-black/10 px-2.5 py-1 text-xs dark:border-white/15"
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
        className={`w-full resize-y rounded-md border p-3 font-mono text-xs ${
          editing
            ? "border-[var(--chart-series-1)] bg-background"
            : "border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]"
        }`}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!editing && (
        <p className="text-xs text-foreground/50">
          Generated live from the canvas. Click &quot;Edit code&quot; to write Qiskit
          calls directly and apply them back to the canvas.
        </p>
      )}
    </div>
  );
}
