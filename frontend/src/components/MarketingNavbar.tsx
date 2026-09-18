"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

/** Hides the navbar on scroll-down, reveals it on scroll-up. setState only
 * ever happens inside the scroll event callback, never synchronously in the
 * effect body, so this doesn't trip react-hooks/set-state-in-effect. */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const goingDown = y > lastY.current;
      setHidden(goingDown && y > 96);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

export default function MarketingNavbar() {
  const hidden = useHideOnScroll();
  const pathname = usePathname();

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-8 py-4 md:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <QyloMark />
          <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">Qylo</span>
        </Link>

        <div className="hidden items-center justify-center gap-9 text-sm text-[var(--foreground-muted)] md:flex">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[var(--foreground)] ${
                  active ? "font-semibold text-[var(--foreground)]" : "font-medium"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle className="bg-[var(--surface-2)]" />
          <Link
            href="/signup"
            className="rounded-full bg-[var(--marketing-ink)] px-5 py-2.5 text-sm font-bold text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}
