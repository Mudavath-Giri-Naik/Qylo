import Link from "next/link";
import { Caveat } from "next/font/google";
import MarketingNavbar from "@/components/MarketingNavbar";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Avatar, AvatarImage, AvatarGroup } from "@/components/ui/avatar";
import { MODULES, moduleDescription, moduleTitle } from "@/lib/learn/modules";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

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
  "QT-M1": ["Qubits", "Fundamentals"],
  "QT-M2": ["Diagrams", "Gates"],
  "QT-M3": ["Algorithms", "Theory"],
  "QT-M4": ["NISQ", "Hybrid"],
};

const PILL_STYLES = [
  { bg: "var(--marketing-green)", fg: "var(--marketing-green-fg)" },
  { bg: "var(--marketing-yellow)", fg: "var(--marketing-yellow-fg)" },
  { bg: "var(--marketing-pink)", fg: "var(--marketing-pink-fg)" },
  { bg: "var(--accent)", fg: "var(--accent-foreground)" },
];

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
      <MarketingNavbar />
      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[var(--marketing-bg)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 bottom-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 70% at 50% 100%, black 40%, transparent 95%)",
            }}
          />

          {/* eslint-disable @next/next/no-img-element -- decorative, local SVGs with spaces in their filenames; next/image blocks local SVGs by default */}
          <img src="/Connected%20world-rafiki.svg" alt="" aria-hidden width={145} height={145} className="pointer-events-none absolute right-[3%] top-20 hidden opacity-90 sm:block" />
          <img src="/Research%20paper-rafiki.svg" alt="" aria-hidden width={105} height={105} className="pointer-events-none absolute right-[3%] top-[360px] hidden opacity-90 md:block" />
          <img src="/Team-rafiki.svg" alt="" aria-hidden width={105} height={105} className="pointer-events-none absolute left-[3%] top-[360px] hidden opacity-90 md:block" />
          <img src="/Online%20learning-rafiki.svg" alt="" aria-hidden width={105} height={105} className="pointer-events-none absolute left-[3%] top-[132px] hidden opacity-90 lg:block" />
          {/* eslint-enable @next/next/no-img-element */}

          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-20 text-center">
            <RevealOnScroll>
              <div className="flex items-center gap-3">
                <AvatarRow />
                <span className="text-sm font-medium text-[var(--foreground-muted)]">
                  AI tutor + real Qiskit simulation
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.08}>
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-[var(--marketing-ink)] sm:text-7xl">
                Learn. Build. Master
                <br />
                <span className="inline-flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon, local PNG */}
                  <img src="/pinwheel-icon.png" alt="" aria-hidden className="h-10 w-10 shrink-0 sm:h-14 sm:w-14" />
                  with Qylo
                </span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={0.16}>
              <p className="mt-6 max-w-3xl text-base text-[var(--foreground-muted)] sm:whitespace-nowrap sm:text-lg">
                Master quantum computing with real circuits and an AI tutor by your side.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.24}>
              <div className="mt-9">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--marketing-yellow)] px-7 py-3.5 text-sm font-semibold text-[var(--marketing-yellow-fg)] shadow-[var(--shadow-md)] transition-transform hover:scale-[1.03]"
                >
                  <span aria-hidden>↳</span> Explore All Modules
                </Link>
              </div>
            </RevealOnScroll>
          </div>

          {/* Bento feature grid */}
          <div className="relative mx-auto max-w-5xl px-6 pb-24">
            <RevealOnScroll delay={0.1}>
              <div className="grid grid-cols-1 grid-rows-2 gap-4 sm:grid-cols-3">
                <div
                  className="flex flex-col justify-between rounded-3xl p-6 sm:col-start-1 sm:row-start-1"
                  style={{ background: "var(--marketing-green)", color: "var(--marketing-green-fg)" }}
                >
                  <AvatarRow />
                  <p className="mt-6 text-lg font-bold leading-snug">AI Tutor &amp; Live Guidance</p>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-2)] sm:col-start-2 sm:row-span-2 sm:row-start-1">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local photo, fills the card via object-cover */}
                  <img src="/instructor-photo.webp" alt="" aria-hidden className="h-full w-full object-cover" />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[var(--surface)]/95 p-4 shadow-[var(--shadow-md)] backdrop-blur">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Learn at your own pace, anywhere, anytime.
                    </p>
                  </div>
                </div>

                <div
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:col-start-3 sm:row-span-2 sm:row-start-1"
                  style={{ background: "var(--marketing-yellow)", color: "var(--marketing-yellow-fg)" }}
                >
                  <p className="text-lg font-bold leading-snug">
                    Every learner deserves clear, hands-on quantum education.
                  </p>
                  <div className="relative mt-6 h-20 w-20 self-end">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local photo, decorative */}
                    <img
                      src="/student-photo.png"
                      alt=""
                      aria-hidden
                      className="h-full w-full rounded-2xl object-cover shadow-[var(--shadow-md)]"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element -- decorative badge, local PNG */}
                    <img src="/sparkle-badge.png" alt="" aria-hidden className="absolute -right-2 -top-2 h-7 w-7" />
                  </div>
                </div>

                <div
                  className="flex flex-col justify-between rounded-3xl p-6 sm:col-start-1 sm:row-start-2"
                  style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon, local PNG */}
                  <img src="/badge-icon.png" alt="" aria-hidden className="h-8 w-8" />
                  <p className="mt-6 text-lg font-bold leading-snug">Real Qiskit Simulation, Real Results</p>
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
              {[...MODULES, ...MODULES].map((m, i) => {
                const style = PILL_STYLES[i % PILL_STYLES.length];
                return (
                  <span
                    key={`${m.code}-${i}`}
                    className="shrink-0 px-6 py-3 text-sm font-semibold"
                    style={{ background: style.bg, color: style.fg }}
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
              const style = PILL_STYLES[i % PILL_STYLES.length];
              const style2 = PILL_STYLES[(i + 1) % PILL_STYLES.length];
              return (
                <RevealOnScroll key={m.code} delay={i * 0.06}>
                  <Link
                    href={`/learn/${m.code}`}
                    className="block h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-[var(--foreground-subtle)]">By: Qylo AI</span>
                      <div className="flex gap-2">
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: style.bg, color: style.fg }}>
                          {tags[0]}
                        </span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: style2.bg, color: style2.fg }}>
                          {tags[1]}
                        </span>
                      </div>
                    </div>

                    <div
                      className="mt-4 flex h-40 items-center justify-center rounded-xl text-sm font-mono font-semibold"
                      style={{ background: `color-mix(in srgb, ${style.bg} 20%, var(--surface-2))`, color: "var(--foreground)" }}
                    >
                      {m.code}
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-[var(--foreground)]">{moduleTitle(m, "en")}</h3>
                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">{moduleDescription(m, "en")}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                      <span aria-hidden>↳</span> Learn More
                    </span>
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
      </main>
    </>
  );
}
