"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircuitBoard, LayoutDashboard, LogOut, Trophy } from "lucide-react";
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
  "/learn": BookOpen,
  "/circuit-builder": CircuitBoard,
  "/challenges": Trophy,
  "/dashboard": LayoutDashboard,
  "/instructor-dashboard": LayoutDashboard,
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
