import Link from "next/link";

const steps = [
  {
    title: "Learn",
    body: "Read through quantum computing modules, from qubits to variational algorithms.",
    icon: (
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" />
    ),
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

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-[0.07]"
          style={{
            background:
              "radial-gradient(600px circle at 50% 0%, var(--accent), transparent 70%)",
          }}
        />
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-sm)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            AI tutor + real Qiskit simulation
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl">
            Learn quantum computing
            <br />
            <span className="text-[var(--accent)]">by doing.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-base text-[var(--foreground-muted)] sm:text-lg">
            Qylo is an interactive platform to learn quantum algorithms, build
            real circuits, test yourself, and track your progress — with
            an AI tutor helping at every step.
          </p>

          <div className="mt-9 flex items-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow-md)] transition-transform hover:scale-[1.02]"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {step.icon}
                </svg>
              </div>
              <h2 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                {step.title}
              </h2>
              <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
