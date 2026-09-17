"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import NavMenuPanel from "@/components/NavMenuPanel";

interface NavLink {
  href: string;
  label: string;
}

export default function NavDrawer({
  loggedIn,
  links,
}: {
  loggedIn: boolean;
  links: NavLink[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // The Circuit Builder page renders its own IBM Composer-style app bar
  // (hamburger included, positioned top-left) and reuses NavMenuPanel
  // directly, so the global header stays out of its way entirely.
  if (pathname === "/circuit-builder") return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Qylo
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <NavMenuPanel open={open} onClose={() => setOpen(false)} loggedIn={loggedIn} links={links} />
    </>
  );
}
