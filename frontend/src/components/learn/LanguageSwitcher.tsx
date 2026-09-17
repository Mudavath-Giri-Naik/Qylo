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
    <div className="flex items-center gap-1 rounded-md border border-black/10 p-1 text-sm dark:border-white/15">
      {SUPPORTED_LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => handleChange(option.code)}
          aria-pressed={current === option.code}
          className={`rounded px-2.5 py-1 transition-colors ${
            current === option.code
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
