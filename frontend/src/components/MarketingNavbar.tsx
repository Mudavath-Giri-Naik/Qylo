import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/circuit-builder", label: "Circuit Builder" },
  { href: "/challenges", label: "Challenges" },
];

function QyloMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="13" cy="13" r="3.2" fill="var(--accent)" />
      <ellipse cx="13" cy="13" rx="11" ry="4.6" stroke="var(--accent)" strokeWidth="1.6" />
      <ellipse cx="13" cy="13" rx="11" ry="4.6" stroke="var(--accent)" strokeWidth="1.6" transform="rotate(60 13 13)" />
      <ellipse cx="13" cy="13" rx="11" ry="4.6" stroke="var(--accent)" strokeWidth="1.6" transform="rotate(120 13 13)" />
    </svg>
  );
}

export default function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <QyloMark />
          <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">Qylo</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-[var(--foreground)] md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--accent)]">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
          <Link
            href="/signup"
            className="rounded-full bg-[var(--marketing-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}
