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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
        {challenge.difficulty}
      </p>
      <p className="mt-1 font-medium text-[var(--foreground)]">{challenge.prompt}</p>

      <div className="mt-4 flex flex-col gap-2">
        {rule.options.map((option, i) => (
          <label
            key={i}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              selected === i
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
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
              className="shrink-0 accent-[var(--accent)]"
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
          className="rounded-lg bg-[var(--accent)] px-4 py-1.5 text-sm font-semibold text-[var(--accent-foreground)] disabled:opacity-60"
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
