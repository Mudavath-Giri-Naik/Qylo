import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
        <Icon className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-[var(--foreground)]">{title}</h1>
      <p className="mt-2 text-[var(--foreground-muted)]">{description}</p>
      <span className="mt-5 rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
        Coming soon
      </span>
    </main>
  );
}
