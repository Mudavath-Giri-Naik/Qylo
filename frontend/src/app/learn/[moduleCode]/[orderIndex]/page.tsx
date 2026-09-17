import Link from "next/link";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/learn/LanguageSwitcher";
import LessonMarkdown from "@/components/learn/LessonMarkdown";
import MarkAsReadButton from "@/components/learn/MarkAsReadButton";
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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/learn/${moduleCode}${langSuffix}`}
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            ← {moduleTitle(mod, lang)}
          </Link>
        </div>
        <LanguageSwitcher current={lang} />
      </div>

      <article className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight" lang={lesson.language}>
          {lesson.title}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-foreground/50">
          <span className="uppercase tracking-wide">{lesson.difficulty}</span>
          {lesson.isFallback && (
            <span className="rounded-full border border-black/10 px-2 py-0.5 dark:border-white/15">
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

      <nav className="mt-10 flex items-center justify-between border-t border-black/10 pt-6 dark:border-white/10">
        {prev ? (
          <Link
            href={`/learn/${moduleCode}/${prev.order_index}${langSuffix}`}
            className="text-sm text-foreground/70 hover:text-foreground"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${moduleCode}/${next.order_index}${langSuffix}`}
            className="text-sm text-foreground/70 hover:text-foreground"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
