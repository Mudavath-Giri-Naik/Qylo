export default function PlaceholderPage({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-start justify-center px-6 py-12">
      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-foreground/60 dark:border-white/15">
        Coming in {phase}
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-foreground/70">{description}</p>
    </main>
  );
}
