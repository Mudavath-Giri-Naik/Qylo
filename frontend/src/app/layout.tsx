import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Noto_Sans_Devanagari, Noto_Sans_Telugu } from "next/font/google";
import NavBar from "@/components/NavBar";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} ${notoTelugu.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <NavBar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
