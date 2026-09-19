import { createClient } from "@/lib/supabase/server";
import type { LessonLanguage } from "@/lib/learn/modules";

export interface LessonSummary {
  id: string;
  module_code: string;
  title: string;
  order_index: number;
  difficulty: string;
  language: LessonLanguage;
  isFallback: boolean;
}

export interface LessonDetail extends LessonSummary {
  body_markdown: string;
}

/** Lessons for a module in the requested language, falling back to English per-lesson if untranslated. */
export async function getModuleLessons(
  moduleCode: string,
  lang: LessonLanguage
): Promise<LessonSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, module_code, title, order_index, difficulty, language")
    .eq("module_code", moduleCode)
    .in("language", lang === "en" ? ["en"] : [lang, "en"])
    .order("order_index", { ascending: true });

  if (error || !data) return [];

  const byOrder = new Map<number, (typeof data)[number]>();
  for (const row of data) {
    const existing = byOrder.get(row.order_index);
    if (!existing || row.language === lang) {
      byOrder.set(row.order_index, row);
    }
  }

  return Array.from(byOrder.values())
    .sort((a, b) => a.order_index - b.order_index)
    .map((row) => ({
      id: row.id,
      module_code: row.module_code,
      title: row.title,
      order_index: row.order_index,
      difficulty: row.difficulty,
      language: row.language as LessonLanguage,
      isFallback: row.language !== lang,
    }));
}

/** Lesson ids the user has completed in this module. */
export async function getModuleProgress(userId: string, moduleCode: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("module_code", moduleCode)
    .eq("status", "completed");

  return new Set((data ?? []).map((row) => row.lesson_id).filter((id): id is string => id !== null));
}

/** A single lesson by module + position, falling back to English if untranslated. */
export async function getLesson(
  moduleCode: string,
  orderIndex: number,
  lang: LessonLanguage
): Promise<LessonDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, module_code, title, body_markdown, order_index, difficulty, language")
    .eq("module_code", moduleCode)
    .eq("order_index", orderIndex)
    .in("language", lang === "en" ? ["en"] : [lang, "en"]);

  if (error || !data || data.length === 0) return null;

  const preferred = data.find((row) => row.language === lang);
  const row = preferred ?? data[0];

  return {
    id: row.id,
    module_code: row.module_code,
    title: row.title,
    body_markdown: row.body_markdown,
    order_index: row.order_index,
    difficulty: row.difficulty,
    language: row.language as LessonLanguage,
    isFallback: row.language !== lang,
  };
}
