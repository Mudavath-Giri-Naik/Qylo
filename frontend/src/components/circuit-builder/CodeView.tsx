"use client";

import { useEffect, useRef, useState } from "react";
import { generateQiskitCode } from "@/lib/circuit/codegen";
import { parseQiskitCode } from "@/lib/circuit/codeparse";
import { generateOpenQasm, parseOpenQasm } from "@/lib/circuit/openqasm";
import { generateCirqCode } from "@/lib/circuit/cirq";
import { generatePennylaneCode } from "@/lib/circuit/pennylane";
import { tokenizeLines } from "@/lib/circuit/highlight";
import type { CircuitJson } from "@/lib/circuit/types";
import { makeTranslator, type Translate } from "@/lib/i18n/composer";

const defaultT = makeTranslator("en");

type Format = "openqasm" | "qiskit" | "cirq" | "pennylane";

const GENERATORS: Record<Format, (circuit: CircuitJson) => string> = {
  openqasm: generateOpenQasm,
  qiskit: generateQiskitCode,
  cirq: generateCirqCode,
  pennylane: generatePennylaneCode,
};

/** Only OpenQASM and Qiskit round-trip back into the canvas -- Cirq and
 * PennyLane are reference exports (matching what the backend can actually
 * execute today: Qiskit Aer, with the others honestly erroring as
 * not-yet-implemented from the backend selector). */
const EDITABLE: Record<Format, boolean> = {
  openqasm: true,
  qiskit: true,
  cirq: false,
  pennylane: false,
};

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
  t = defaultT,
}: {
  circuit: CircuitJson;
  onApplyCircuit: (circuit: CircuitJson) => void;
  compact?: boolean;
  t?: Translate;
}) {
  const [format, setFormat] = useState<Format>("openqasm");
  const generated = GENERATORS[format](circuit);
  const [draft, setDraft] = useState(generated);
  const [error, setError] = useState<string | null>(null);
  const selfEditRef = useRef(false);

  // Resync the editor's text from the circuit whenever it changes for a
  // reason OTHER than this editor's own last edit (a canvas drag, undo, a
  // loaded circuit, or switching format) -- never while the user is mid-typing.
  useEffect(() => {
    if (selfEditRef.current) {
      selfEditRef.current = false;
      return;
    }
    setDraft(generated);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuit, format]);

  function handleChange(value: string) {
    setDraft(value);
    if (!EDITABLE[format]) return;
    const result = format === "openqasm" ? parseOpenQasm(value) : parseQiskitCode(value);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    selfEditRef.current = true;
    onApplyCircuit(result.circuit!);
  }

  const lines = tokenizeLines(draft);
  const lineCount = lines.length;
  const editable = EDITABLE[format];

  return (
    <div className={compact ? "flex h-full flex-col overflow-hidden" : "overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-sm)]"}>
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--composer-panel)] px-3 py-2">
        <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            aria-label={t("codeFormat")}
            className="cursor-pointer appearance-none bg-transparent pr-1 uppercase tracking-wide text-[var(--foreground)] outline-none"
          >
            <option value="openqasm">OpenQASM</option>
            <option value="qiskit">Qiskit</option>
            <option value="cirq">Cirq</option>
            <option value="pennylane">PennyLane</option>
          </select>
          <ChevronIcon />
        </label>
        {!editable && (
          <span className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-subtle)]">
            {t("readOnly")}
          </span>
        )}
      </div>

      <div className={`flex flex-1 bg-[var(--composer-panel-2)] ${compact ? "min-h-0 overflow-auto" : ""}`}>
        <pre
          aria-hidden
          className="select-none overflow-hidden py-3 pl-3 pr-2 text-right font-mono text-xs leading-5 text-[var(--foreground-subtle)]"
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
        </pre>
        <div className="relative flex-1">
          <pre aria-hidden className="pointer-events-none whitespace-pre-wrap break-all py-3 pl-1 pr-4 font-mono text-xs leading-5">
            {lines.map((lineTokens, i) => (
              <div key={i}>
                {lineTokens.length === 0
                  ? " "
                  : lineTokens.map((tok, j) => (
                      <span key={j} className={tok.cls}>
                        {tok.text}
                      </span>
                    ))}
              </div>
            ))}
          </pre>
          <textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={!editable}
            spellCheck={false}
            className="absolute inset-0 h-full w-full resize-none whitespace-pre-wrap break-all bg-transparent py-3 pl-1 pr-4 font-mono text-xs leading-5 text-transparent caret-[var(--foreground)] outline-none"
          />
        </div>
      </div>
      {error && (
        <p className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
