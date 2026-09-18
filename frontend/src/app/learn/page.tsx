import CourseGrid, { type CourseCardData } from "@/components/learn/CourseGrid";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/queries";
import { MODULE_META } from "@/lib/learn/moduleMeta";
import {
  MODULES,
  isLessonLanguage,
  moduleDescription,
  moduleTitle,
} from "@/lib/learn/modules";

export default async function LearnPage({ searchParams }: PageProps<"/learn">) {
  const params = await searchParams;
  const langParam = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const lang = isLessonLanguage(langParam) ? langParam : "en";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const progressByModule = new Map<string, { lessonsRead: number; totalLessons: number }>();
  if (user) {
    const { modules } = await getDashboardData(user.id);
    for (const m of modules) progressByModule.set(m.module_code, m);
  }

  const courses: CourseCardData[] = MODULES.map((mod) => {
    const meta = MODULE_META[mod.code];
    const progress = progressByModule.get(mod.code);
    const totalLessons = progress?.totalLessons ?? 0;
    const lessonsRead = progress?.lessonsRead ?? 0;
    const percent = totalLessons > 0 ? Math.round((lessonsRead / totalLessons) * 100) : 0;

    return {
      code: mod.code,
      title: moduleTitle(mod, lang),
      description: moduleDescription(mod, lang),
      lessons: totalLessons,
      hours: meta.hours,
      percent,
      href: `/learn/${mod.code}${lang === "en" ? "" : `?lang=${lang}`}`,
    };
  });

  return (
    <main className="mx-auto flex max-w-7xl flex-col px-6 py-5 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
      <CourseGrid courses={courses} lang={lang} />
    </main>
  );
}
