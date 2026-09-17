import { createClient } from "@/lib/supabase/server";
import { MODULES, moduleTitle } from "@/lib/learn/modules";

export interface ModuleProgress {
  module_code: string;
  title: string;
  lessonsRead: number;
  totalLessons: number;
  challengesPassed: number;
  totalChallenges: number;
}

export interface SubmissionSummary {
  id: string;
  challenge_id: string;
  prompt: string;
  module_code: string;
  score: number;
  passed: boolean;
  timestamp: string;
}

export interface DashboardData {
  modules: ModuleProgress[];
  submissions: SubmissionSummary[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const [{ data: lessons }, { data: progress }, { data: submissions }, { data: challenges }] =
    await Promise.all([
      supabase.from("lessons").select("id, module_code").eq("language", "en"),
      supabase.from("progress").select("module_code, lesson_id, status").eq("user_id", userId),
      supabase
        .from("submissions")
        .select("id, challenge_id, score, timestamp")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false }),
      supabase.from("challenges").select("id, module_code, prompt"),
    ]);

  const lessonsByModule = new Map<string, number>();
  for (const l of lessons ?? []) {
    lessonsByModule.set(l.module_code, (lessonsByModule.get(l.module_code) ?? 0) + 1);
  }

  const challengesByModule = new Map<string, number>();
  const challengeById = new Map<string, { module_code: string; prompt: string }>();
  for (const c of challenges ?? []) {
    challengesByModule.set(c.module_code, (challengesByModule.get(c.module_code) ?? 0) + 1);
    challengeById.set(c.id, { module_code: c.module_code, prompt: c.prompt });
  }

  const lessonsReadByModule = new Map<string, number>();
  const challengesPassedByModule = new Map<string, Set<string>>();

  for (const p of progress ?? []) {
    if (p.status !== "completed") continue;
    if (p.lesson_id) {
      lessonsReadByModule.set(p.module_code, (lessonsReadByModule.get(p.module_code) ?? 0) + 1);
    }
  }

  const passedChallengeIds = new Set<string>();
  for (const s of submissions ?? []) {
    if ((s.score ?? 0) >= 70) {
      passedChallengeIds.add(s.challenge_id);
      const info = challengeById.get(s.challenge_id);
      if (info) {
        const set = challengesPassedByModule.get(info.module_code) ?? new Set<string>();
        set.add(s.challenge_id);
        challengesPassedByModule.set(info.module_code, set);
      }
    }
  }

  const modules: ModuleProgress[] = MODULES.map((mod) => ({
    module_code: mod.code,
    title: moduleTitle(mod, "en"),
    lessonsRead: lessonsReadByModule.get(mod.code) ?? 0,
    totalLessons: lessonsByModule.get(mod.code) ?? 0,
    challengesPassed: challengesPassedByModule.get(mod.code)?.size ?? 0,
    totalChallenges: challengesByModule.get(mod.code) ?? 0,
  }));

  const submissionSummaries: SubmissionSummary[] = (submissions ?? []).map((s) => {
    const info = challengeById.get(s.challenge_id);
    return {
      id: s.id,
      challenge_id: s.challenge_id,
      prompt: info?.prompt ?? "Unknown challenge",
      module_code: info?.module_code ?? "?",
      score: s.score ?? 0,
      passed: (s.score ?? 0) >= 70,
      timestamp: s.timestamp,
    };
  });

  return { modules, submissions: submissionSummaries };
}
