import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Noto_Sans_Devanagari, Noto_Sans_Telugu } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getSidebarStats } from "@/lib/dashboard/queries";
import AppShell from "@/components/AppShell";
import SmoothScroll from "@/components/SmoothScroll";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Runs before hydration so a returning dark-theme visitor never sees a flash
// of the light theme. The default (no stored choice, or first visit) is
// light -- set statically on <html> below -- regardless of OS preference.
const THEME_INIT_SCRIPT = `
try {
  if (localStorage.getItem('qylo-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (e) {}
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
});

const notoTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-telugu",
  subsets: ["telugu"],
});

export const metadata: Metadata = {
  title: "Qylo | Quantum Algorithm Learning Platform",
  description:
    "Learn, build, and test quantum algorithms with an AI tutor at every step.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "learner" | "instructor" | null = null;
  let sidebarStats = null;
  if (user) {
    const [{ data: profile }, stats] = await Promise.all([
      supabase.from("users").select("role").eq("id", user.id).single(),
      getSidebarStats(),
    ]);
    role = profile?.role ?? null;
    sidebarStats = stats;
  }

  const links = user
    ? [
        role === "instructor"
          ? { href: "/instructor-dashboard", label: "Instructor Dashboard" }
          : { href: "/dashboard", label: "Dashboard" },
        { href: "/learn", label: "Learn" },
        { href: "/circuit-builder", label: "Quantum Circuits" },
        { href: "/challenges", label: "Challenges" },
        { href: "/community", label: "Community" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/my-progress", label: "My Progress" },
        { href: "/hardware-access", label: "Hardware Access" },
        { href: "/certificates", label: "Certificates" },
        { href: "/settings", label: "Settings" },
      ]
    : [];

  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} ${notoTelugu.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SmoothScroll />
        <TooltipProvider>
          <AppShell loggedIn={!!user} userId={user?.id ?? null} userEmail={user?.email ?? null} links={links} sidebarStats={sidebarStats}>
            {children}
          </AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
