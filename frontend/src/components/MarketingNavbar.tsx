"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/circuit-builder", label: "Circuit Builder" },
  { href: "/challenges", label: "Challenges" },
];

// Not sticky on purpose: the navbar scrolls away with the hero instead of
// pinning to the top, so it's only visible back at the top of the page.
export default function MarketingNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-40 bg-transparent">
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-8 md:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand mark, local PNG */}
            <img src="/pinwheel-icon.png" alt="" aria-hidden className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">Qylo</span>
        </Link>

        <div className="hidden items-center justify-center gap-9 text-sm text-white/80 md:flex">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-white ${active ? "font-semibold text-white" : "font-medium"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-white/90 transition-colors hover:text-white sm:inline"
          >
            Log in
          </Link>
          <ThemeToggle className="border-white/30 bg-white/10 text-white hover:bg-white/20" />
          <Link
            href="/signup"
            className="rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[var(--accent)] shadow-sm transition-opacity hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Get Started
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/20 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-[var(--surface-hover)] ${
                  active ? "font-semibold text-[var(--foreground)]" : "font-medium text-[var(--foreground-muted)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
