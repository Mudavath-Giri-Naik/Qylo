"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { SUPPORTED_LANGUAGES } from "@/lib/learn/modules";
import type { Translate, UiLang } from "@/lib/i18n/composer";

export default function ComposerFooter({
  lang,
  onLangChange,
  t,
}: {
  lang: UiLang;
  onLangChange: (lang: UiLang) => void;
  t: Translate;
}) {
  const footerLinks: [string, string][] = [
    ["terms", t("terms")],
    ["privacy", t("privacy")],
    ["cookiePreferences", t("cookiePreferences")],
    ["support", t("support")],
    ["accessibility", t("accessibility")],
    ["security", t("security")],
  ];

  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--composer-bar)] px-4 py-2 text-xs text-[var(--foreground-subtle)]">
      <span className="font-semibold text-[var(--foreground-muted)]">Qylo</span>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {footerLinks.map(([key, label]) => (
          <span key={key}>{label}</span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[var(--foreground-muted)]">
          <span className="sr-only">{t("language")}</span>
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value as UiLang)}
            aria-label={t("language")}
            className="cursor-pointer bg-transparent text-[var(--foreground-muted)] outline-none"
          >
            {SUPPORTED_LANGUAGES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <ThemeToggle />
      </div>
    </footer>
  );
}
