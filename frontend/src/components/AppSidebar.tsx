"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  CircuitBoard,
  Cpu,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { SidebarStats } from "@/lib/dashboard/queries";
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
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

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
  links,
  stats,
}: {
  loggedIn: boolean;
  links: NavLink[];
  stats: SidebarStats | null;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 text-base font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand mark, local PNG */}
          <img src="/ai.png" alt="" aria-hidden className="h-5 w-5 shrink-0 dark:invert" />
          <span className="group-data-[collapsible=icon]:hidden">Qylo</span>
        </Link>
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
        {stats && (
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
        )}
        <div className="flex items-center justify-between gap-2 px-1">
          <ThemeToggle />
          {loggedIn ? (
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="icon" title="Log out">
                <LogOut />
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
