import { Award, Cpu, Target, Zap, type LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  relative: string | null;
}

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  "first-circuit": Award,
  "challenge-solver": Target,
  "week-streak": Zap,
  "hardware-explorer": Cpu,
};

export const ACHIEVEMENT_COLORS: Record<string, { bg: string; fg: string }> = {
  "first-circuit": { bg: "color-mix(in srgb, var(--accent) 15%, transparent)", fg: "var(--accent)" },
  "challenge-solver": { bg: "color-mix(in srgb, var(--marketing-green) 15%, transparent)", fg: "var(--marketing-green)" },
  "week-streak": { bg: "rgb(249 115 22 / 0.15)", fg: "rgb(234 88 12)" },
  "hardware-explorer": { bg: "rgb(59 130 246 / 0.15)", fg: "rgb(37 99 235)" },
};

const DAY_MS = 24 * 60 * 60 * 1000;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / DAY_MS);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function buildAchievements(params: {
  circuitsBuilt: number;
  firstCircuitAt: string | null;
  challengesSolved: number;
  lastSolvedAt: string | null;
  streakDays: number;
}): Achievement[] {
  return [
    {
      id: "first-circuit",
      title: "First Circuit",
      description: "Built and ran your first quantum circuit",
      unlocked: params.circuitsBuilt >= 1,
      relative: params.firstCircuitAt ? relativeTime(params.firstCircuitAt) : null,
    },
    {
      id: "challenge-solver",
      title: "Challenge Solver",
      description: params.challengesSolved >= 1 ? `Solved ${params.challengesSolved} challenges` : "Solve your first challenge",
      unlocked: params.challengesSolved >= 1,
      relative: params.lastSolvedAt ? relativeTime(params.lastSolvedAt) : null,
    },
    {
      id: "week-streak",
      title: "7 Day Streak",
      description: "Learned for 7 consecutive days",
      unlocked: params.streakDays >= 7,
      relative: params.streakDays >= 7 ? "Today" : null,
    },
    {
      id: "hardware-explorer",
      title: "Hardware Explorer",
      description: "Run a circuit on real hardware -- coming soon",
      unlocked: false,
      relative: null,
    },
  ];
}
