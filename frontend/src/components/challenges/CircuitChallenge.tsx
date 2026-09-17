"use client";

import { useState } from "react";
import CircuitBuilder from "@/components/circuit-builder/CircuitBuilder";
import { emptyCircuit } from "@/lib/circuit/types";
import type { Challenge, CircuitGradingRule } from "@/lib/challenges/types";

export default function CircuitChallenge({ challenge }: { challenge: Challenge }) {
  const rule = challenge.grading_rule as CircuitGradingRule;
  const [passed, setPassed] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
          {challenge.difficulty} · circuit challenge
        </p>
        {passed && (
          <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            ✓ Passed
          </span>
        )}
      </div>
      <p className="mt-1 font-medium text-[var(--foreground)]">{challenge.prompt}</p>

      <div className="mt-4">
        <CircuitBuilder
          initialCircuit={challenge.starter_data ?? emptyCircuit(rule.num_qubits)}
          challenge={{ id: challenge.id, onResult: setPassed }}
        />
      </div>
    </div>
  );
}
