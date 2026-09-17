import { createClient } from "@/lib/supabase/server";

export interface InstructorClass {
  id: string;
  name: string;
  join_code: string | null;
}

export interface StuckEntry {
  challenge_id: string;
  prompt: string;
  attempts: number;
}

export interface RosterEntry {
  student_id: string;
  email: string;
  moduleCompletion: { module_code: string; fraction: number }[];
  stuckOn: StuckEntry[];
}

export interface ClassDashboard {
  roster: RosterEntry[];
  moduleAverageScore: { module_code: string; average: number; count: number }[];
}

const PASS_SCORE_THRESHOLD = 70;
const STUCK_ATTEMPT_THRESHOLD = 3;

export async function getInstructorClasses(instructorId: string): Promise<InstructorClass[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("classes")
    .select("id, name, join_code")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getClassDashboard(classId: string): Promise<ClassDashboard> {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId);
  const studentIds = (members ?? []).map((m) => m.student_id);

  if (studentIds.length === 0) {
    return { roster: [], moduleAverageScore: [] };
  }

  const [{ data: students }, { data: progressRows }, { data: submissionRows }, { data: lessons }, { data: challenges }] =
    await Promise.all([
      supabase.from("users").select("id, email").in("id", studentIds),
      supabase.from("progress").select("user_id, module_code, lesson_id, status").in("user_id", studentIds),
      supabase
        .from("submissions")
        .select("user_id, challenge_id, score")
        .in("user_id", studentIds),
      supabase.from("lessons").select("module_code").eq("language", "en"),
      supabase.from("challenges").select("id, module_code, prompt"),
    ]);

  const lessonsByModule = new Map<string, number>();
  for (const l of lessons ?? []) {
    lessonsByModule.set(l.module_code, (lessonsByModule.get(l.module_code) ?? 0) + 1);
  }
  const moduleCodesInOrder = Array.from(lessonsByModule.keys()).sort();

  const challengeById = new Map<string, { module_code: string; prompt: string }>();
  for (const c of challenges ?? []) {
    challengeById.set(c.id, { module_code: c.module_code, prompt: c.prompt });
  }

  // Per-student per-module lessons-read counts.
  const lessonsReadByStudentModule = new Map<string, number>();
  for (const p of progressRows ?? []) {
    if (p.status !== "completed" || !p.lesson_id) continue;
    const key = `${p.user_id}:${p.module_code}`;
    lessonsReadByStudentModule.set(key, (lessonsReadByStudentModule.get(key) ?? 0) + 1);
  }

  // Per-student per-challenge attempt/pass tracking, for the "stuck" flag.
  const attemptsByStudentChallenge = new Map<string, { attempts: number; passed: boolean }>();
  // Per-module score accumulation, across the whole class.
  const moduleScoreSum = new Map<string, { sum: number; count: number }>();

  for (const s of submissionRows ?? []) {
    const key = `${s.user_id}:${s.challenge_id}`;
    const entry = attemptsByStudentChallenge.get(key) ?? { attempts: 0, passed: false };
    entry.attempts += 1;
    if ((s.score ?? 0) >= PASS_SCORE_THRESHOLD) entry.passed = true;
    attemptsByStudentChallenge.set(key, entry);

    const info = challengeById.get(s.challenge_id);
    if (info) {
      const acc = moduleScoreSum.get(info.module_code) ?? { sum: 0, count: 0 };
      acc.sum += s.score ?? 0;
      acc.count += 1;
      moduleScoreSum.set(info.module_code, acc);
    }
  }

  const roster: RosterEntry[] = (students ?? []).map((student) => {
    const moduleCompletion = moduleCodesInOrder.map((module_code) => {
      const total = lessonsByModule.get(module_code) ?? 0;
      const read = lessonsReadByStudentModule.get(`${student.id}:${module_code}`) ?? 0;
      return { module_code, fraction: total ? read / total : 0 };
    });

    const stuckOn: StuckEntry[] = [];
    for (const [key, entry] of attemptsByStudentChallenge.entries()) {
      const [studentId, challengeId] = key.split(":");
      if (studentId !== student.id) continue;
      if (entry.attempts >= STUCK_ATTEMPT_THRESHOLD && !entry.passed) {
        const info = challengeById.get(challengeId);
        stuckOn.push({
          challenge_id: challengeId,
          prompt: info?.prompt ?? "Unknown challenge",
          attempts: entry.attempts,
        });
      }
    }

    return { student_id: student.id, email: student.email, moduleCompletion, stuckOn };
  });

  const moduleAverageScore = moduleCodesInOrder
    .filter((m) => moduleScoreSum.has(m))
    .map((module_code) => {
      const acc = moduleScoreSum.get(module_code)!;
      return { module_code, average: acc.sum / acc.count, count: acc.count };
    });

  return { roster, moduleAverageScore };
}
