"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SUPPORTED_LANGUAGES, type LessonLanguage } from "@/lib/learn/modules";

export default function LanguageSwitcher({
  current,
}: {
  current: LessonLanguage;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(lang: LessonLanguage) {
    const params = new URLSearchParams(searchParams.toString());
    if (lang === "en") {
      params.delete("lang");
    } else {
      params.set("lang", lang);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-sm shadow-[var(--shadow-sm)]">
      {SUPPORTED_LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => handleChange(option.code)}
          aria-pressed={current === option.code}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            current === option.code
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
