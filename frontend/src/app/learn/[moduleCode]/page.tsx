import Link from "next/link";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/learn/LanguageSwitcher";
import { getModuleLessons } from "@/lib/learn/queries";
import { MODULES, isLessonLanguage, moduleTitle } from "@/lib/learn/modules";

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

  const lessons = await getModuleLessons(moduleCode, lang);
  const langSuffix = lang === "en" ? "" : `?lang=${lang}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/learn" className="text-sm text-foreground/60 hover:text-foreground">
            ← All modules
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight" lang={lang}>
            {moduleTitle(mod, lang)}
          </h1>
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            {mod.code}
          </span>
        </div>
        <LanguageSwitcher current={lang} />
      </div>

      <ol className="mt-8 flex flex-col gap-3">
        {lessons.map((lesson, i) => (
          <li key={lesson.id}>
            <Link
              href={`/learn/${moduleCode}/${lesson.order_index}${langSuffix}`}
              className="flex items-center justify-between rounded-lg border border-black/10 px-5 py-4 transition-colors hover:border-foreground/30 dark:border-white/10"
            >
              <span className="flex items-center gap-3">
                <span className="text-sm text-foreground/40">{i + 1}</span>
                <span lang={lesson.language}>{lesson.title}</span>
              </span>
              {lesson.isFallback && (
                <span className="text-xs text-foreground/50">English</span>
              )}
            </Link>
          </li>
        ))}
        {lessons.length === 0 && (
          <p className="text-foreground/60">No lessons in this module yet.</p>
        )}
      </ol>
    </main>
  );
}
