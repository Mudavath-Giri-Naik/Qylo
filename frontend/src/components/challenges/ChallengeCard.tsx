"use client";

import { Target, Users } from "lucide-react";
import { MODULE_META, DIFFICULTY_BADGE, THEME_STYLES } from "@/lib/learn/moduleMeta";
import { moduleTitle, MODULES } from "@/lib/learn/modules";
import {
  challengeTypeLabel,
  communityStats,
  deriveTags,
  normalizeDifficulty,
  pointsFor,
} from "@/lib/challenges/presentation";
import type { Challenge } from "@/lib/challenges/types";

export default function ChallengeCard({
  challenge,
  passed,
  compact,
  onSolve,
}: {
  challenge: Challenge;
  passed: boolean;
  compact: boolean;
  onSolve: (challenge: Challenge) => void;
}) {
  const difficulty = normalizeDifficulty(challenge.difficulty);
  const badge = DIFFICULTY_BADGE[difficulty];
  const meta = MODULE_META[challenge.module_code];
  const theme = meta ? THEME_STYLES[meta.theme] : null;
  const mod = MODULES.find((m) => m.code === challenge.module_code);
  const tags = deriveTags(challenge);
  const points = pointsFor(challenge);
  const { attempts, successRate } = communityStats(challenge);
  const Icon = meta?.icon;

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        {Icon && theme && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.iconBg }}>
            <Icon className="h-4 w-4" style={{ color: theme.iconFg }} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--foreground)]">{challenge.prompt}</h3>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: badge.bg, color: badge.fg }}>
              {difficulty}
            </span>
            {passed && (
              <span className="shrink-0 rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ Passed
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-[var(--foreground-muted)]">
            {mod ? moduleTitle(mod, "en") : challenge.module_code} · {challengeTypeLabel(challenge)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-[11px] text-[var(--foreground-muted)]">
          <span className="hidden items-center gap-1 sm:flex">
            <Users className="h-3 w-3" />
            {attempts.toLocaleString()}
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <Target className="h-3 w-3" />
            {successRate}%
          </span>
          <span className="font-bold text-[var(--foreground)]">{points} pts</span>
        </div>

        <button
          type="button"
          onClick={() => onSolve(challenge)}
          className="shrink-0 rounded-lg bg-[var(--marketing-ink)] px-3.5 py-1.5 text-[11px] font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
        >
          {passed ? "Review" : "Solve"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--border-strong)]">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: badge.bg, color: badge.fg }}>
          {difficulty}
        </span>
        <span className="text-xs font-bold text-[var(--foreground)]">{points} pts</span>
      </div>

      <h3 className="mt-2.5 line-clamp-3 text-sm font-bold leading-snug text-[var(--foreground)]">{challenge.prompt}</h3>
      <p className="mt-1 text-[11px] text-[var(--foreground-muted)]">
        {mod ? moduleTitle(mod, "en") : challenge.module_code} · {challengeTypeLabel(challenge)}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <div className="flex items-center gap-2.5 text-[11px] text-[var(--foreground-muted)]">
          <span className="flex items-center gap-1" title="Illustrative community stat">
            <Users className="h-3 w-3" />
            {attempts.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" title="Illustrative community stat">
            <Target className="h-3 w-3" />
            {successRate}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSolve(challenge)}
          className="shrink-0 rounded-lg bg-[var(--marketing-ink)] px-3.5 py-1.5 text-[11px] font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
        >
          {passed ? "Review" : "Solve"}
        </button>
      </div>
      {passed && (
        <span className="mt-2 self-start rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
          ✓ Passed
        </span>
      )}
    </div>
  );
}
