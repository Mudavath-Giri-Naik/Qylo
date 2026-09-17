import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/queries";
import JoinClassForm from "@/components/dashboard/JoinClassForm";

function ProgressBar({ fraction }: { fraction: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.round(Math.min(1, fraction) * 100)}%`,
          background: "var(--chart-series-1)",
        }}
      />
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { modules, submissions } = await getDashboardData(user.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Welcome{user.email ? `, ${user.email}` : ""}
          </h1>
          <p className="mt-1 text-[var(--foreground-muted)]">Your progress across every module.</p>
        </div>
        <JoinClassForm />
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Module completion</h2>
        <div className="mt-4 flex flex-col gap-5">
          {modules.map((m) => (
            <div key={m.module_code}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-[var(--foreground)]">
                  {m.module_code} · {m.title}
                </span>
                <span className="text-[var(--foreground-subtle)]">
                  {m.lessonsRead}/{m.totalLessons} lessons
                  {m.totalChallenges > 0 && ` · ${m.challengesPassed}/${m.totalChallenges} challenges`}
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar fraction={m.totalLessons ? m.lessonsRead / m.totalLessons : 0} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Challenge attempts</h2>
        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--foreground-muted)]">No challenge attempts yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm"
              >
                <span className="truncate pr-4 text-[var(--foreground)]">
                  <span className="text-[var(--foreground-subtle)]">{s.module_code}</span> — {s.prompt}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    s.passed
                      ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-700 dark:text-red-400"
                  }`}
                >
                  {s.passed ? "Passed" : "Not yet"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
