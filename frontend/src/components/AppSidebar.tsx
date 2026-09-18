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
  Sparkle,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
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
}: {
  loggedIn: boolean;
  links: NavLink[];
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 text-base font-semibold tracking-tight">
          Qylo
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
        <div className="group-data-[collapsible=icon]:hidden relative overflow-hidden rounded-xl border border-[var(--border)] p-3" style={{ background: "linear-gradient(150deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)" }}>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
            Turn ideas into quantum reality.
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--marketing-green)]" />
          </div>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">Learn. Build. Run. Collaborate.</p>
          <Sparkle aria-hidden className="pointer-events-none absolute -bottom-2 -right-2 h-10 w-10 text-[var(--accent)]/15" />
        </div>
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
