"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, ChevronDown, LogOut, Search, Settings, Zap } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  href: string;
  label: string;
}

function TopBar({ userEmail }: { userEmail: string | null }) {
  const initial = userEmail ? userEmail[0]!.toUpperCase() : "?";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border)] px-4">
      <SidebarTrigger />

      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
        <Input placeholder="Search courses, algorithms, challenges..." className="h-9 rounded-lg pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/hardware-access">
            <Zap className="h-4 w-4" />
            Run on Hardware
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <p className="px-2 py-3 text-sm text-[var(--foreground-muted)]">You&apos;re all caught up.</p>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-[var(--surface-hover)]"
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-[var(--accent)] font-semibold text-[var(--accent-foreground)]">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-[var(--foreground-muted)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="truncate">{userEmail ?? "Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={logoutAction} className="w-full">
                <button type="submit" className="flex w-full items-center gap-2 text-left">
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AppShell({
  loggedIn,
  userEmail,
  links,
  children,
}: {
  loggedIn: boolean;
  userEmail: string | null;
  links: NavLink[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return <div className="flex-1">{children}</div>;
  }

  const isComposer = pathname === "/circuit-builder";

  return (
    <SidebarProvider>
      <AppSidebar loggedIn={loggedIn} links={links} />
      <SidebarInset>
        {isComposer ? (
          <header className="flex h-12 shrink-0 items-center border-b border-[var(--border)] px-3">
            <SidebarTrigger />
          </header>
        ) : (
          <TopBar userEmail={userEmail} />
        )}
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
