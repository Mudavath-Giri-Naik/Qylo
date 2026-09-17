"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";

interface NavLink {
  href: string;
  label: string;
}

export default function NavMenuPanel({
  open,
  onClose,
  loggedIn,
  links,
}: {
  open: boolean;
  onClose: () => void;
  loggedIn: boolean;
  links: NavLink[];
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <span className="text-sm font-semibold text-[var(--foreground)]">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-[var(--border)] p-3">
          {loggedIn ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                Log out
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="w-full rounded-lg bg-[var(--accent)] px-3 py-2.5 text-center text-sm font-medium text-[var(--accent-foreground)]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
