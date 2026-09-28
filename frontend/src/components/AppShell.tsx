"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Search, Zap } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import type { AppNotification, SidebarStats } from "@/lib/dashboard/queries";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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

const NOTIFICATION_DOT: Record<AppNotification["tone"], string> = {
  green: "bg-[var(--marketing-green)]",
  orange: "bg-orange-500",
  blue: "bg-[var(--accent)]",
};

function TopBar({ notifications }: { notifications: AppNotification[] }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 sm:h-16 sm:gap-3 sm:px-4">
      <SidebarTrigger />

      <div className="relative hidden min-w-0 flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
        <Input placeholder="Search courses, algorithms, challenges..." className="h-9 rounded-lg pl-9" />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/hardware-access">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Run on Hardware</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative shrink-0 rounded-full">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2 py-3 text-sm text-[var(--foreground-muted)]">You&apos;re all caught up.</p>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem key={n.id} asChild className="items-start gap-2.5 py-2">
                  <Link href={n.href}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NOTIFICATION_DOT[n.tone]}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-[var(--foreground)]">{n.title}</span>
                      <span className="block truncate text-xs text-[var(--foreground-muted)]">{n.detail}</span>
                      <span className="block text-[10px] text-[var(--foreground-subtle)]">{n.relative}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AppShell({
  loggedIn,
  userId,
  userEmail,
  userName,
  userAvatarUrl,
  links,
  sidebarStats,
  notifications,
  children,
}: {
  loggedIn: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userAvatarUrl: string | null;
  links: NavLink[];
  sidebarStats: SidebarStats | null;
  notifications: AppNotification[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return <div className="flex-1">{children}</div>;
  }

  const isComposer = pathname === "/circuit-builder";

  return (
    <SidebarProvider>
      <AppSidebar
        loggedIn={loggedIn}
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        links={links}
        stats={sidebarStats}
      />
      <SidebarInset className={isComposer ? "lg:h-svh lg:overflow-hidden" : undefined}>
        {isComposer ? (
          <header className="flex h-12 shrink-0 items-center border-b border-[var(--border)] px-3">
            <SidebarTrigger />
          </header>
        ) : (
          <TopBar notifications={notifications} />
        )}
        <div className={isComposer ? "min-h-0 flex-1 lg:overflow-hidden" : "flex-1"}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
