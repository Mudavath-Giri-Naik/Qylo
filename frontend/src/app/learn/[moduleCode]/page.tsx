import { notFound } from "next/navigation";
import CourseDetail from "@/components/learn/CourseDetail";
import { createClient } from "@/lib/supabase/server";
import { getModuleLessons, getModuleProgress } from "@/lib/learn/queries";
import { MODULES, isLessonLanguage, moduleDescription, moduleTitle } from "@/lib/learn/modules";
import { MODULE_META } from "@/lib/learn/moduleMeta";
import { MODULE_AUDIENCE, MODULE_HERO, MODULE_INSTRUCTOR, MODULE_LONG_DESCRIPTION } from "@/lib/learn/presentation";

export default async function ModulePage({
  params,
  searchParams,
}: PageProps<"/learn/[moduleCode]">) {
  const { moduleCode } = await params;
  const searchParamsResolved = await searchParams;
  const langParam = Array.isArray(searchParamsResolved.lang)
    ? searchParamsResolved.lang[0]
    : searchParamsResolved.lang;
  const lang = isLessonLanguage(langParam) ? langParam : "en";

  const mod = MODULES.find((m) => m.code === moduleCode);
  if (!mod) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [lessons, completedLessonIds] = await Promise.all([
    getModuleLessons(moduleCode, lang),
    getModuleProgress(user.id, moduleCode),
  ]);

  const meta = MODULE_META[moduleCode];

  return (
    <CourseDetail
      moduleCode={moduleCode}
      title={moduleTitle(mod, lang)}
      description={moduleDescription(mod, lang)}
      longDescription={MODULE_LONG_DESCRIPTION[moduleCode] ?? moduleDescription(mod, lang)}
      audience={MODULE_AUDIENCE[moduleCode] ?? []}
      instructor={MODULE_INSTRUCTOR[moduleCode] ?? { name: "Qylo Faculty", title: "Quantum Computing Instructor" }}
      hero={MODULE_HERO[moduleCode] ?? { lead: "Explore", highlight: moduleTitle(mod, lang), note: "" }}
      difficulty={meta.difficulty}
      hours={meta.hours}
      lessons={lessons}
      completedLessonIds={Array.from(completedLessonIds)}
      lang={lang}
    />
  );
}
