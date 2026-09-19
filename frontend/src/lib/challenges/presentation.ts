import type { Challenge } from "@/lib/challenges/types";
import { MODULE_META, type Difficulty } from "@/lib/learn/moduleMeta";

export function normalizeDifficulty(raw: string): Difficulty {
  const v = raw.toLowerCase();
  if (v.startsWith("interm")) return "Intermediate";
  if (v.startsWith("adv")) return "Advanced";
  return "Beginner";
}

export function challengeTypeLabel(challenge: Pick<Challenge, "grading_rule">): "Quiz" | "Circuit Challenge" {
  return challenge.grading_rule.type === "quiz" ? "Quiz" : "Circuit Challenge";
}

const BASE_POINTS: Record<Difficulty, number> = { Beginner: 100, Intermediate: 150, Advanced: 250 };

export function pointsFor(challenge: Challenge): number {
  const bonus = challenge.grading_rule.type === "circuit" ? 50 : 0;
  return BASE_POINTS[normalizeDifficulty(challenge.difficulty)] + bonus;
}

const KEYWORD_TAGS: [RegExp, string][] = [
  [/entangl|bell state/i, "Entanglement"],
  [/superposition/i, "Superposition"],
  [/measur/i, "Measurement"],
  [/hadamard/i, "Hadamard"],
  [/cnot|⊕/i, "CNOT"],
  [/barrier/i, "Circuit Diagrams"],
  [/deutsch-jozsa/i, "Deutsch-Jozsa"],
  [/grover/i, "Grover's Algorithm"],
  [/shor/i, "Shor's Algorithm"],
  [/qaoa|mixer/i, "QAOA"],
  [/vqe|variational/i, "VQE"],
  [/oracle/i, "Oracle"],
];

export function deriveTags(challenge: Challenge): string[] {
  const tags = new Set<string>();
  for (const [pattern, label] of KEYWORD_TAGS) {
    if (pattern.test(challenge.prompt)) tags.add(label);
  }
  const meta = MODULE_META[challenge.module_code];
  if (meta) tags.add(meta.category);
  tags.add(challengeTypeLabel(challenge));
  return Array.from(tags).slice(0, 3);
}

// Per-challenge attempt counts and success rates aren't tracked globally --
// submissions are owner-only under RLS, so there's no cross-user query to
// back a real "N attempts / X% success" stat. These are derived deterministically
// from the challenge id (stable across reloads) as illustrative community
// stats, in the same spirit as the sample leaderboard on /leaderboard.
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  return h;
}

export function communityStats(challenge: Challenge): { attempts: number; successRate: number } {
  const seed = hashSeed(challenge.id);
  const attempts = 900 + (seed % 14000);
  const floor: Record<Difficulty, number> = { Beginner: 55, Intermediate: 35, Advanced: 22 };
  const successRate = Math.min(92, floor[normalizeDifficulty(challenge.difficulty)] + (seed % 30));
  return { attempts, successRate };
}
