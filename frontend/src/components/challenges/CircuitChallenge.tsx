"use client";

import { useState } from "react";
import CircuitBuilder from "@/components/circuit-builder/CircuitBuilder";
import { emptyCircuit } from "@/lib/circuit/types";
import type { Challenge, CircuitGradingRule } from "@/lib/challenges/types";

export default function CircuitChallenge({ challenge }: { challenge: Challenge }) {
  const rule = challenge.grading_rule as CircuitGradingRule;
  const [passed, setPassed] = useState(false);

  return (
    <div className="rounded-lg border border-black/10 p-5 dark:border-white/10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
          {challenge.difficulty} · circuit challenge
        </p>
        {passed && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ✓ Passed
          </span>
        )}
      </div>
      <p className="mt-1 font-medium">{challenge.prompt}</p>

      <div className="mt-4">
        <CircuitBuilder
          initialCircuit={challenge.starter_data ?? emptyCircuit(rule.num_qubits)}
          challenge={{ id: challenge.id, onResult: setPassed }}
        />
      </div>
    </div>
  );
}
