"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { moduleTitle, MODULES } from "@/lib/learn/modules";
import { challengeTypeLabel } from "@/lib/challenges/presentation";
import type { Challenge } from "@/lib/challenges/types";
import QuizChallenge from "@/components/challenges/QuizChallenge";
import CircuitChallenge from "@/components/challenges/CircuitChallenge";

export default function ChallengeModal({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const mod = MODULES.find((m) => m.code === challenge.module_code);
  const isCircuit = challenge.grading_rule.type === "circuit";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 sm:pt-16" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div
        className={`relative z-10 mb-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] ${
          isCircuit ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
            {mod ? moduleTitle(mod, "en") : challenge.module_code} · {challengeTypeLabel(challenge)}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          {challenge.grading_rule.type === "quiz" ? (
            <QuizChallenge challenge={challenge} />
          ) : (
            <CircuitChallenge challenge={challenge} />
          )}
        </div>
      </div>
    </div>
  );
}
