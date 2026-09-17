import Link from "next/link";

const steps = [
  {
    title: "Learn",
    body: "Read through quantum computing modules, from qubits to variational algorithms.",
  },
  {
    title: "Build",
    body: "Drag gates onto qubits or write code, then run real circuits and see the result.",
  },
  {
    title: "Test",
    body: "Take quizzes and coding challenges that check your understanding.",
  },
  {
    title: "Track",
    body: "Watch your progress grow, module by module, with an AI tutor alongside you.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Learn quantum computing by doing.
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-foreground/70">
          Qylo is an interactive platform to learn quantum algorithms, build
          real circuits, test yourself, and track your progress &mdash; with
          an AI tutor helping at every step.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-medium dark:border-white/15"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-lg border border-black/10 p-5 dark:border-white/10"
            >
              <h2 className="text-sm font-semibold text-foreground/50">
                {step.title}
              </h2>
              <p className="mt-2 text-sm text-foreground/80">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
