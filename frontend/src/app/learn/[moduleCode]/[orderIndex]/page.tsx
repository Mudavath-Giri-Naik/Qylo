import Link from "next/link";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/learn/LanguageSwitcher";
import LessonMarkdown from "@/components/learn/LessonMarkdown";
import MarkAsReadButton from "@/components/learn/MarkAsReadButton";
import AgentChat from "@/components/agent/AgentChat";
import { getLesson, getModuleLessons } from "@/lib/learn/queries";
import { MODULES, isLessonLanguage, moduleTitle } from "@/lib/learn/modules";

export default async function LessonPage({
  params,
  searchParams,
}: PageProps<"/learn/[moduleCode]/[orderIndex]">) {
  const { moduleCode, orderIndex } = await params;
  const searchParamsResolved = await searchParams;
  const langParam = Array.isArray(searchParamsResolved.lang)
    ? searchParamsResolved.lang[0]
    : searchParamsResolved.lang;
  const lang = isLessonLanguage(langParam) ? langParam : "en";

  const mod = MODULES.find((m) => m.code === moduleCode);
  const orderIndexNum = Number(orderIndex);
  if (!mod || Number.isNaN(orderIndexNum)) notFound();

  const [lesson, lessons] = await Promise.all([
    getLesson(moduleCode, orderIndexNum, lang),
    getModuleLessons(moduleCode, lang),
  ]);
  if (!lesson) notFound();

  const langSuffix = lang === "en" ? "" : `?lang=${lang}`;
  const currentPos = lessons.findIndex((l) => l.order_index === orderIndexNum);
  const prev = currentPos > 0 ? lessons[currentPos - 1] : null;
  const next =
    currentPos >= 0 && currentPos < lessons.length - 1
      ? lessons[currentPos + 1]
      : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/learn/${moduleCode}${langSuffix}`}
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            ← {moduleTitle(mod, lang)}
          </Link>
        </div>
        <LanguageSwitcher current={lang} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]" lang={lesson.language}>
              {lesson.title}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-[var(--foreground-subtle)]">
              <span className="uppercase tracking-wide">{lesson.difficulty}</span>
              {lesson.isFallback && (
                <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                  Not yet translated — showing English
                </span>
              )}
            </div>

            <div className="mt-6" lang={lesson.language}>
              <LessonMarkdown markdown={lesson.body_markdown} />
            </div>

            <div className="mt-8">
              <MarkAsReadButton moduleCode={moduleCode} lessonId={lesson.id} />
            </div>
          </article>

          <nav className="mt-6 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
            {prev ? (
              <Link
                href={`/learn/${moduleCode}/${prev.order_index}${langSuffix}`}
                className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/learn/${moduleCode}/${next.order_index}${langSuffix}`}
                className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>

        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <AgentChat
            title="Ask the tutor"
            moduleCode={moduleCode}
            placeholder="Ask about this lesson..."
          />
        </div>
      </div>
    </main>
  );
}
