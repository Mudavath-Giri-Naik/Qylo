"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface NavLink {
  href: string;
  label: string;
}

export default function AppShell({
  loggedIn,
  links,
  children,
}: {
  loggedIn: boolean;
  links: NavLink[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  // The Circuit Builder page renders its own IBM Composer-style app bar
  // (hamburger, nav drawer, everything) and needs the full viewport for
  // its no-scroll layout, so it opts out of the sidebar shell entirely.
  if (pathname === "/circuit-builder") {
    return <div className="flex-1">{children}</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar loggedIn={loggedIn} links={links} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center border-b border-[var(--border)] px-3">
          <SidebarTrigger />
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
