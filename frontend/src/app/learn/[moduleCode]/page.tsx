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
          <Link href="/learn" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            ← All modules
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]" lang={lang}>
            {moduleTitle(mod, lang)}
          </h1>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
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
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-medium text-[var(--foreground-muted)]">
                  {i + 1}
                </span>
                <span className="text-[var(--foreground)]" lang={lesson.language}>{lesson.title}</span>
              </span>
              {lesson.isFallback && (
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--foreground-subtle)]">English</span>
              )}
            </Link>
          </li>
        ))}
        {lessons.length === 0 && (
          <p className="text-[var(--foreground-muted)]">No lessons in this module yet.</p>
        )}
      </ol>
    </main>
  );
}
