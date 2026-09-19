"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronsUpDown,
  CircuitBoard,
  Cpu,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { SidebarStats } from "@/lib/dashboard/queries";
import { defaultLocalProfile, useLocalProfile } from "@/hooks/useLocalProfile";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

// Illustrative per-route variants of the sidebar's "live" stat card -- there's
// no real presence/credits system behind these (unlike the default Qubits
// Executed card below, which is real), but the reference design shows a
// different themed card per page, so this keeps that visual intent without
// claiming a backend that doesn't exist.
interface RouteWidget {
  label: string;
  live: boolean;
  value: string;
  subtitle: string;
  bars: number[];
  cta?: { label: string; href: string };
}

const ROUTE_WIDGETS: Record<string, RouteWidget> = {
  "/challenges": {
    label: "Challenge Participants",
    live: true,
    value: "1,284",
    subtitle: "solving challenges now",
    bars: [40, 65, 50, 80, 60, 90, 75],
  },
  "/community": {
    label: "Online Now",
    live: true,
    value: "124",
    subtitle: "learners online",
    bars: [55, 70, 60, 85, 65, 95, 80],
    cta: { label: "View All Members", href: "/community" },
  },
  "/leaderboard": {
    label: "Global Learners",
    live: true,
    value: "12,480",
    subtitle: "from 42 countries",
    bars: [45, 60, 55, 75, 65, 88, 78],
    cta: { label: "View Community", href: "/community" },
  },
  "/hardware-access": {
    label: "Compute Credits",
    live: false,
    value: "50",
    subtitle: "credits remaining",
    bars: [70, 65, 60, 55, 50, 45, 40],
  },
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/instructor-dashboard": LayoutDashboard,
  "/learn": BookOpen,
  "/circuit-builder": CircuitBoard,
  "/challenges": Trophy,
  "/community": Users,
  "/leaderboard": BarChart3,
  "/my-progress": TrendingUp,
  "/hardware-access": Cpu,
  "/certificates": Award,
  "/settings": Settings,
};

export default function AppSidebar({
  loggedIn,
  userId,
  userEmail,
  userName,
  userAvatarUrl,
  links,
  stats,
}: {
  loggedIn: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userAvatarUrl: string | null;
  links: NavLink[];
  stats: SidebarStats | null;
}) {
  const pathname = usePathname();
  const routeWidget = ROUTE_WIDGETS[pathname];
  const defaults = defaultLocalProfile(userEmail ?? "", null, userName, userAvatarUrl);
  const { profile } = useLocalProfile(userId ?? "anonymous", defaults);
  const initial = profile.displayName ? profile.displayName[0]!.toUpperCase() : "?";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-1 px-2 py-1.5">
          <Link href="/" className="flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand mark, local PNG */}
            <img src="/ai.png" alt="" aria-hidden className="h-5 w-5 shrink-0 dark:invert" />
            <span className="truncate group-data-[collapsible=icon]:hidden">Qylo</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1 group-data-[collapsible=icon]:hidden">
            <ThemeToggle className="h-7 w-7" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => {
                const Icon = ICONS[link.href] ?? BookOpen;
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={link.label}>
                      <Link href={link.href}>
                        <Icon />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {routeWidget ? (
          <div
            className="group-data-[collapsible=icon]:hidden relative overflow-hidden rounded-xl border border-[var(--border)] p-3"
            style={{ background: "linear-gradient(150deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--foreground)]">{routeWidget.label}</span>
              {routeWidget.live && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--marketing-green)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--marketing-green)]" /> Online
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{routeWidget.value}</p>
            <p className="text-[11px] text-[var(--foreground-muted)]">{routeWidget.subtitle}</p>
            <div className="mt-2 flex h-8 items-end gap-1">
              {routeWidget.bars.map((v, i) => (
                <span key={i} className="flex-1 rounded-sm bg-indigo-500/70" style={{ height: `${Math.max(10, v)}%` }} />
              ))}
            </div>
            {routeWidget.cta && (
              <Link
                href={routeWidget.cta.href}
                className="mt-2 block rounded-lg bg-[var(--surface)] px-2 py-1.5 text-center text-[11px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                {routeWidget.cta.label}
              </Link>
            )}
          </div>
        ) : (
          stats && (
            <div
              className="group-data-[collapsible=icon]:hidden relative overflow-hidden rounded-xl border border-[var(--border)] p-3"
              style={{ background: "linear-gradient(150deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]">Qubits Executed</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--marketing-green)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--marketing-green)]" /> Live
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.qubitsExecuted.toLocaleString()}</p>
              <p className="text-[11px] text-[var(--foreground-muted)]">Circuits run by learners this week</p>
              <div className="mt-2 flex h-8 items-end gap-1">
                {stats.dailyQubits.map((value, i) => {
                  const max = Math.max(1, ...stats.dailyQubits);
                  return (
                    <span
                      key={i}
                      className="flex-1 rounded-sm bg-indigo-500/70"
                      style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )
        )}
        {loggedIn ? (
          <>
            <div className="hidden justify-center group-data-[collapsible=icon]:flex">
              <ThemeToggle className="h-8 w-8" />
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
                        <AvatarFallback className="rounded-lg font-semibold text-[var(--accent-foreground)]" style={{ background: profile.avatarColor ?? "var(--accent)" }}>
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid min-w-0 flex-1 text-left leading-tight">
                        <span className="truncate text-sm font-semibold">{profile.displayName}</span>
                        <span className="truncate text-xs text-[var(--foreground-muted)]">{userEmail}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-[var(--foreground-muted)]" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
                          <AvatarFallback className="rounded-lg font-semibold text-[var(--accent-foreground)]" style={{ background: profile.avatarColor ?? "var(--accent)" }}>
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid min-w-0 flex-1 text-left leading-tight">
                          <span className="truncate text-sm font-semibold">{profile.displayName}</span>
                          <span className="truncate text-xs text-[var(--foreground-muted)]">{userEmail}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="hidden group-data-[collapsible=icon]:block">
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:hidden">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
