import { createClient } from "@/lib/supabase/server";
import type { ModuleProgress } from "@/lib/dashboard/queries";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SkillPoint {
  skill: string;
  value: number;
}

// Derived from real progress/challenge/circuit signals -- there's no separate
// "skills" taxonomy tracked in the schema, so each axis maps to the closest
// real metric available (module completion, challenge pass rate, circuits
// saved). Hardware usage is honestly 0 until real hardware runs exist.
export function computeSkillProgress(
  modules: ModuleProgress[],
  overview: { challengesSolved: number; totalChallenges: number; circuitsBuilt: number }
): SkillPoint[] {
  const byCode = new Map(modules.map((m) => [m.module_code, m]));
  const pct = (code: string) => {
    const m = byCode.get(code);
    return m && m.totalLessons > 0 ? Math.round((m.lessonsRead / m.totalLessons) * 100) : 0;
  };

  const problemSolving = overview.totalChallenges > 0 ? Math.round((overview.challengesSolved / overview.totalChallenges) * 100) : 0;
  const simulation = Math.min(100, overview.circuitsBuilt * 12);

  return [
    { skill: "Quantum Circuits", value: pct("QT-M2") },
    { skill: "Algorithms", value: Math.round((pct("QT-M3") + pct("QT-M4")) / 2) },
    { skill: "Mathematics", value: pct("QT-M1") },
    { skill: "Simulation (Qiskit)", value: simulation },
    { skill: "Hardware Usage", value: 0 },
    { skill: "Problem Solving", value: problemSolving },
  ];
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface ActivityHeatmap {
  weeks: HeatmapDay[][];
  maxCount: number;
}

const HEATMAP_WEEKS = 13;

export async function getActivityHeatmap(userId: string): Promise<ActivityHeatmap> {
  const supabase = await createClient();
  const rangeStart = new Date(Date.now() - (HEATMAP_WEEKS * 7 - 1) * DAY_MS);
  rangeStart.setHours(0, 0, 0, 0);

  const [{ data: progressRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("progress")
      .select("last_accessed")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("last_accessed", rangeStart.toISOString()),
    supabase.from("submissions").select("timestamp").eq("user_id", userId).gte("timestamp", rangeStart.toISOString()),
  ]);

  const counts = new Map<string, number>();
  const bump = (iso: string) => {
    const key = new Date(iso).toDateString();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  for (const p of progressRows ?? []) bump(p.last_accessed);
  for (const s of submissionRows ?? []) bump(s.timestamp);

  const alignedStart = new Date(rangeStart);
  const mondayOffset = (alignedStart.getDay() + 6) % 7;
  alignedStart.setDate(alignedStart.getDate() - mondayOffset);

  const today = new Date();
  let maxCount = 0;
  const weeks: HeatmapDay[][] = [];

  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const week: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(alignedStart);
      day.setDate(alignedStart.getDate() + w * 7 + d);
      const count = day <= today ? counts.get(day.toDateString()) ?? 0 : 0;
      maxCount = Math.max(maxCount, count);
      week.push({ date: day.toISOString().slice(0, 10), count });
    }
    weeks.push(week);
  }

  return { weeks, maxCount };
}

export async function getFirstCircuitDate(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("circuits")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.created_at ?? null;
}
