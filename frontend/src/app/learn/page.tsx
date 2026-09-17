import Link from "next/link";
import LanguageSwitcher from "@/components/learn/LanguageSwitcher";
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

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Learn</h1>
          <p className="mt-1 text-foreground/70">
            Pick a module to start reading.
          </p>
        </div>
        <LanguageSwitcher current={lang} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => (
          <Link
            key={mod.code}
            href={`/learn/${mod.code}${lang === "en" ? "" : `?lang=${lang}`}`}
            className="rounded-lg border border-black/10 p-5 transition-colors hover:border-foreground/30 dark:border-white/10"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
              {mod.code}
            </span>
            <h2 className="mt-1 text-lg font-semibold" lang={lang}>
              {moduleTitle(mod, lang)}
            </h2>
            <p className="mt-2 text-sm text-foreground/70" lang={lang}>
              {moduleDescription(mod, lang)}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
