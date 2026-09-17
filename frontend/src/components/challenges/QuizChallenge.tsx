"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitChallenge } from "@/lib/challenges/api";
import type { Challenge, QuizGradingRule } from "@/lib/challenges/types";

export default function QuizChallenge({ challenge }: { challenge: Challenge }) {
  const rule = challenge.grading_rule as QuizGradingRule;
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (selected === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const res = await submitChallenge(challenge.id, { userId: user.id, selectedIndex: selected });
      setResult({ passed: res.passed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 p-5 dark:border-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
        {challenge.difficulty}
      </p>
      <p className="mt-1 font-medium">{challenge.prompt}</p>

      <div className="mt-4 flex flex-col gap-2">
        {rule.options.map((option, i) => (
          <label
            key={i}
            className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${
              selected === i
                ? "border-[var(--chart-series-1)] bg-[var(--chart-series-1)]/10"
                : "border-black/10 dark:border-white/15"
            }`}
          >
            <input
              type="radio"
              name={`quiz-${challenge.id}`}
              checked={selected === i}
              onChange={() => {
                setSelected(i);
                setResult(null);
              }}
              className="shrink-0"
            />
            {option}
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected === null || submitting}
          className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background disabled:opacity-60"
        >
          {submitting ? "Checking..." : "Submit"}
        </button>
        {result && (
          <span
            className={`text-sm font-medium ${
              result.passed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {result.passed ? "✓ Correct" : "✗ Not quite — try again"}
          </span>
        )}
        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
      </div>
    </div>
  );
}
