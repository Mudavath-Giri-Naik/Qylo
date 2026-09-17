"use client";

import ThemeToggle from "@/components/ThemeToggle";

const FOOTER_LINKS = ["Terms", "Privacy", "Cookie preferences", "Support", "Accessibility", "Security"];

export default function ComposerFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--composer-bar)] px-4 py-2.5 text-xs text-[var(--foreground-subtle)]">
      <span className="font-semibold text-[var(--foreground-muted)]">Qylo</span>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {FOOTER_LINKS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-md border border-[var(--border)] px-2 py-1 text-[var(--foreground-muted)]">
          English
        </span>
        <ThemeToggle />
      </div>
    </footer>
  );
}
