import { createClient } from "@/lib/supabase/server";
import { MODULES, moduleTitle } from "@/lib/learn/modules";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

export interface ActivityItem {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  relative: string;
  tone: "green" | "blue" | "pink" | "orange";
}

export interface StreakDay {
  label: string;
  active: boolean;
  isToday: boolean;
}

export interface DashboardOverview {
  totalModules: number;
  circuitsBuilt: number;
  circuitsThisMonth: number;
  challengesSolved: number;
  challengesAttempted: number;
  totalChallenges: number;
  overallPercent: number;
  weeklyLessonPercent: number;
  currentModule: { code: string; title: string; percent: number } | null;
  recentActivity: ActivityItem[];
  weeklyStreak: StreakDay[];
  streakDays: number;
  challengesThisWeek: number;
  nextSuggestion: { moduleCode: string; moduleTitle: string; prompt: string } | null;
}

export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  const supabase = await createClient();
  const { modules, submissions } = await getDashboardData(userId);

  const [{ count: circuitsBuilt }, { count: circuitsThisMonth }, { data: progressRows }] = await Promise.all([
    supabase.from("circuits").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("circuits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 30 * DAY_MS).toISOString()),
    supabase
      .from("progress")
      .select("module_code, status, last_accessed")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  const totalLessons = modules.reduce((sum, m) => sum + m.totalLessons, 0);
  const lessonsRead = modules.reduce((sum, m) => sum + m.lessonsRead, 0);
  const totalChallenges = modules.reduce((sum, m) => sum + m.totalChallenges, 0);
  const challengesSolved = modules.reduce((sum, m) => sum + m.challengesPassed, 0);
  const overallPercent = totalLessons + totalChallenges > 0
    ? Math.round(((lessonsRead + challengesSolved) / (totalLessons + totalChallenges)) * 100)
    : 0;

  const weekAgo = Date.now() - 7 * DAY_MS;
  const recentProgress = (progressRows ?? []).filter((p) => new Date(p.last_accessed).getTime() >= weekAgo);
  const weeklyLessonPercent = totalLessons > 0 ? Math.round((recentProgress.length / totalLessons) * 100) : 0;

  // Weekly streak: which of the last 7 calendar days (Mon-Sun of the current week) had
  // a completed lesson or a challenge submission.
  const activeDayKeys = new Set<string>();
  for (const p of progressRows ?? []) activeDayKeys.add(new Date(p.last_accessed).toDateString());
  for (const s of submissions) activeDayKeys.add(new Date(s.timestamp).toDateString());

  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7; // 0 = Monday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - mondayOffset);

  const weeklyStreak: StreakDay[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return {
      label: DAY_LABELS[day.getDay()],
      active: activeDayKeys.has(day.toDateString()) && day <= today,
      isToday: day.toDateString() === today.toDateString(),
    };
  });

  let streakDays = 0;
  for (let d = new Date(today); ; d.setDate(d.getDate() - 1)) {
    if (!activeDayKeys.has(d.toDateString())) break;
    streakDays += 1;
  }

  const challengesThisWeek = submissions.filter(
    (s) => s.passed && new Date(s.timestamp).getTime() >= weekAgo
  ).length;

  const recentActivity: ActivityItem[] = submissions.slice(0, 5).map((s) => ({
    id: s.id,
    label: s.passed ? `Solved challenge: ${s.prompt}` : `Attempted challenge: ${s.prompt}`,
    detail: s.module_code,
    timestamp: s.timestamp,
    relative: relativeTime(s.timestamp),
    tone: s.passed ? "green" : "orange",
  }));

  const inProgress = modules.find((m) => m.totalLessons > 0 && m.lessonsRead < m.totalLessons);
  const currentModule = inProgress
    ? {
        code: inProgress.module_code,
        title: inProgress.title,
        percent: Math.round((inProgress.lessonsRead / inProgress.totalLessons) * 100),
      }
    : null;

  const needsChallenge = modules.find((m) => m.totalChallenges > 0 && m.challengesPassed < m.totalChallenges);
  const nextSuggestion = needsChallenge
    ? { moduleCode: needsChallenge.module_code, moduleTitle: needsChallenge.title, prompt: "an unsolved challenge" }
    : null;

  return {
    totalModules: modules.length,
    circuitsBuilt: circuitsBuilt ?? 0,
    circuitsThisMonth: circuitsThisMonth ?? 0,
    challengesSolved,
    challengesAttempted: submissions.length,
    totalChallenges,
    overallPercent,
    weeklyLessonPercent,
    currentModule,
    recentActivity,
    weeklyStreak,
    streakDays,
    challengesThisWeek,
    nextSuggestion,
  };
}
