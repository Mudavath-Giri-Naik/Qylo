import type { Viewport } from "next";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { Sparkle } from "lucide-react";
import MarketingNavbar from "@/components/MarketingNavbar";
import HeroCloudBackground from "@/components/HeroCloudBackground";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Avatar, AvatarImage, AvatarGroup } from "@/components/ui/avatar";
import { MODULES, moduleTitle } from "@/lib/learn/modules";
import { MODULE_INSTRUCTOR } from "@/lib/learn/presentation";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

// Pins the layout viewport to desktop width so phones render the full
// desktop design (nav links, multi-column grids, floating illustrations)
// and auto-zoom it to fit the screen, rather than reflowing to a mobile
// layout -- this page is meant to look identical to desktop, just smaller.
export const viewport: Viewport = {
  width: 1280,
  // Explicitly cleared: Next always defaults initialScale to 1, which would
  // force a 1:1 pixel crop instead of letting the browser auto-compute a
  // fit-to-width zoom for the wider-than-device layout viewport above.
  initialScale: undefined,
};

const STEPS = [
  {
    title: "Learn",
    body: "Read through quantum computing modules, from qubits to variational algorithms.",
    icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" />,
  },
  {
    title: "Build",
    body: "Drag gates onto qubits or write code, then run real circuits and see the result.",
    icon: <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4M8 8h8v8H8z" />,
  },
  {
    title: "Test",
    body: "Take quizzes and coding challenges that check your understanding.",
    icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />,
  },
  {
    title: "Track",
    body: "Watch your progress grow, module by module, with an AI tutor alongside you.",
    icon: <path d="M3 3v18h18M7 16l4-6 4 3 5-8" />,
  },
];

const MODULE_TAGS: Record<string, [string, string]> = {
  "QT-M1": ["Quantum Computing", "Fundamentals"],
  "QT-M2": ["Circuit Design", "Quantum Gates"],
  "QT-M3": ["Algorithms", "Quantum Theory"],
  "QT-M4": ["NISQ", "Hybrid Algorithms"],
};

// Short, single-line blurbs for the module cards -- separate from the
// fuller moduleDescription() used on the course detail hero, which reads
// better at that length but is too long for this card layout.
const MODULE_CARD_BLURB: Record<string, string> = {
  "QT-M1": "Master qubits and gates for real quantum programs.",
  "QT-M2": "Master circuit design for reliable quantum programs.",
  "QT-M3": "Master landmark algorithms for real quantum speedups.",
  "QT-M4": "Master hybrid algorithms for today's quantum hardware.",
};

const MODULE_IMAGES: Record<string, string> = {
  "QT-M1": "/first.png",
  "QT-M2": "/second.png",
  "QT-M3": "/third.png",
  "QT-M4": "/fourth.png",
};

const PILL_STYLES = [
  { bg: "var(--marketing-green)", fg: "var(--marketing-green-fg)" },
  { bg: "var(--marketing-yellow)", fg: "var(--marketing-yellow-fg)" },
  { bg: "var(--marketing-pink)", fg: "var(--marketing-pink-fg)" },
  { bg: "var(--accent)", fg: "var(--accent-foreground)" },
];

const CARD_ACCENT_STYLES = [
  { bg: "var(--accent)", fg: "var(--accent-foreground)" },
  { bg: "var(--marketing-pink)", fg: "var(--marketing-pink-fg)" },
];
const CARD_CATEGORY_STYLE = { bg: "var(--marketing-yellow)", fg: "var(--marketing-yellow-fg)" };

const AVATAR_PHOTOS = ["/avatar-1.png", "/avatar-2.png", "/avatar-3.png", "/avatar-4.png"];

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}

function AvatarRow() {
  return (
    <AvatarGroup>
      {AVATAR_PHOTOS.map((src) => (
        <Avatar key={src}>
          <AvatarImage src={src} alt="" />
        </Avatar>
      ))}
    </AvatarGroup>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero -- cloud shader sits behind the navbar, intro block, and the
          bento cards below it, all in one continuous sky. It lives in its
          own clipped layer; the navbar stays a direct child of this
          `relative` (not `overflow-hidden`) wrapper so its `sticky` still
          works (an overflow-hidden ancestor would break sticky). */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <HeroCloudBackground className="h-full w-full" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-64 sm:h-80"
            style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
          />
        </div>

        <MarketingNavbar />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-14 text-center">
          <RevealOnScroll>
            <div className="flex items-center gap-3">
              <AvatarRow />
              <span className="text-sm font-medium text-white drop-shadow-sm">
                AI tutor + real Qiskit simulation
              </span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.08}>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-7xl">
              Learn. Build. Master
              <br />
              with Qylo
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={0.16}>
            <p className="mt-6 max-w-3xl text-base text-white drop-shadow-sm sm:whitespace-nowrap sm:text-lg">
              Master quantum computing with real circuits and an AI tutor by your side.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--accent)] shadow-[var(--shadow-md)] transition-transform hover:scale-[1.03]"
              >
                Explore All Modules
              </Link>
              <Link
                href="/circuit-builder"
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Try Circuit Builder
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/70">Free to get started · No credit card required</p>
          </RevealOnScroll>
        </div>

        {/* Floating product preview -- shown at its full natural aspect
            ratio (no fixed-height crop) so the whole dashboard is visible */}
        <div className="relative mx-auto mt-2 max-w-7xl px-6 pb-24">
          <RevealOnScroll delay={0.32}>
            <div className="rounded-2xl border border-white/30 bg-white/10 p-2 shadow-2xl backdrop-blur-md sm:p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- local screenshot, sized via CSS like the other content photos in this file */}
              <img src="/dashboard.png" alt="Qylo dashboard preview" className="h-auto w-full rounded-xl" />
            </div>
          </RevealOnScroll>
        </div>
      </div>

      <main className="overflow-x-hidden">
        {/* Bento feature grid -- moved below the hero, back on the normal page background */}
        <section className="relative overflow-hidden bg-[var(--marketing-bg)] py-20">
          <div className="relative mx-auto max-w-5xl px-6">
            <RevealOnScroll delay={0.1}>
              <div className="grid grid-cols-1 grid-rows-2 gap-4 sm:grid-cols-3">
                <div
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:col-start-1 sm:row-start-1"
                  style={{ background: "var(--marketing-green)", color: "#000000" }}
                >
                  <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/25" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-black/5" />
                  <div className="relative z-10">
                    <AvatarRow />
                  </div>
                  <p className="relative z-10 mt-6 text-2xl font-bold leading-snug">AI Tutor &amp; Live Guidance</p>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-2)] sm:col-start-2 sm:row-span-2 sm:row-start-1">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local photo, fills the card via object-cover */}
                  <img src="/instructor-photo.webp" alt="" aria-hidden className="h-full w-full object-cover" />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[var(--surface)]/95 p-6 shadow-[var(--shadow-md)] backdrop-blur">
                    <p className="text-base font-semibold text-[var(--foreground)]">
                      Learn at your own pace, anywhere, anytime.
                    </p>
                  </div>
                </div>

                <div
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:col-start-3 sm:row-span-2 sm:row-start-1"
                  style={{ background: "var(--marketing-yellow)", color: "#000000" }}
                >
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/25" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-black/5" />
                  <p className="relative z-10 text-2xl font-bold leading-snug">
                    Every learner deserves clear, hands-on quantum education.
                  </p>
                  <div className="relative z-10 mt-6 h-20 w-20 self-center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local photo, decorative */}
                    <img
                      src="/student-photo.png"
                      alt=""
                      aria-hidden
                      className="h-full w-full rounded-2xl object-cover shadow-[var(--shadow-md)]"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element -- decorative badge, local PNG */}
                    <img src="/sparkle-badge.png" alt="" aria-hidden className="absolute -right-2 -top-2 h-7 w-7 rotate-90" />
                  </div>
                </div>

                <div
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:col-start-1 sm:row-start-2"
                  style={{ background: "var(--accent)", color: "#000000" }}
                >
                  <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-black/10" />
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon, local PNG */}
                  <img src="/badge-icon.png" alt="" aria-hidden className="relative z-10 h-8 w-8" />
                  <p className="relative z-10 mt-6 text-2xl font-bold leading-snug">Real Qiskit Simulation, Real Results</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Module marquee */}
        <section className="bg-[var(--background)] py-20">
          <RevealOnScroll>
            <p className={`${caveat.className} text-center text-2xl text-[var(--foreground-muted)]`}>
              What Modules We Cover! <span aria-hidden>↓</span>
            </p>
          </RevealOnScroll>

          <div className="group relative mt-8 overflow-hidden">
            <div className="animate-marquee flex w-max gap-4 group-hover:[animation-play-state:paused]">
              {[...MODULES, ...MODULES, ...MODULES, ...MODULES, ...MODULES, ...MODULES].map((m, i) => {
                const style = PILL_STYLES[i % PILL_STYLES.length];
                return (
                  <span
                    key={`${m.code}-${i}`}
                    className="shrink-0 px-8 py-4 text-lg font-extrabold"
                    style={{ background: style.bg, color: "#000000" }}
                  >
                    {moduleTitle(m, "en")}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {/* Modules grid */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <RevealOnScroll>
            <div className="flex items-start justify-between gap-4">
              <div>
                <GraduationCapIcon className="h-8 w-8 text-[var(--marketing-green)]" />
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--marketing-ink)] sm:text-5xl">
                  Browse All Modules
                </h2>
              </div>
              <p className={`${caveat.className} mt-2 hidden text-xl text-[var(--foreground-muted)] sm:block`}>
                find your path <span aria-hidden>↘</span>
              </p>
            </div>
          </RevealOnScroll>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {MODULES.map((m, i) => {
              const tags = MODULE_TAGS[m.code] ?? ["Quantum", "Qylo"];
              const accent = CARD_ACCENT_STYLES[i % CARD_ACCENT_STYLES.length];
              const author = MODULE_INSTRUCTOR[m.code]?.name ?? "Qylo AI";
              const image = MODULE_IMAGES[m.code];
              return (
                <RevealOnScroll key={m.code} delay={i * 0.06}>
                  <Link
                    href={`/learn/${m.code}`}
                    className="block h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--foreground)]">By: {author}</span>
                      <div className="flex shrink-0 gap-2">
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: accent.bg, color: accent.fg }}>
                          {tags[0]}
                        </span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: CARD_CATEGORY_STYLE.bg, color: CARD_CATEGORY_STYLE.fg }}>
                          {tags[1]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-stretch gap-5">
                      <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl sm:h-36 sm:w-36">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local photo, sized via CSS like the other content photos in this file */}
                        <img src={image} alt="" aria-hidden className="h-full w-full object-cover" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[var(--foreground)]">{moduleTitle(m, "en")}</h3>
                          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{MODULE_CARD_BLURB[m.code]}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                          <span aria-hidden>↳</span> Learn More
                        </span>
                      </div>
                    </div>
                  </Link>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <RevealOnScroll key={step.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {step.icon}
                    </svg>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">{step.body}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <RevealOnScroll>
            <div
              className="relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16 sm:py-20"
              style={{ background: "var(--marketing-green)", color: "#000000" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.16) 38%, transparent 50%, rgba(255,255,255,0.1) 65%, transparent 78%)",
                }}
              />
              <Sparkle aria-hidden className="pointer-events-none absolute bottom-8 left-8 h-10 w-10 text-black/10 sm:h-14 sm:w-14" />
              <Sparkle aria-hidden className="pointer-events-none absolute bottom-10 right-10 h-7 w-7 text-black/15 sm:h-9 sm:w-9" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-3">
                  <AvatarRow />
                  <span className="text-sm font-semibold">Join a growing community of learners</span>
                </div>

                <h2 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                  Take the Next Step in Your Quantum Journey
                </h2>

                <p className="mt-5 max-w-xl text-base sm:text-lg">
                  Unlock real quantum skills with hands-on circuits, live simulation, and an AI tutor by your side.
                </p>

                <div className="mt-8">
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--marketing-ink)] px-7 py-3.5 text-sm font-bold text-[var(--background)] transition-opacity hover:opacity-90"
                  >
                    <span aria-hidden>↳</span> Start Learning Now
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>
    </>
  );
}
