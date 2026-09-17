import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/queries";
import JoinClassForm from "@/components/dashboard/JoinClassForm";

function ProgressBar({ fraction }: { fraction: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
      <div
        className="h-full rounded-full"
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
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome{user.email ? `, ${user.email}` : ""}
          </h1>
          <p className="mt-1 text-foreground/60">Your progress across every module.</p>
        </div>
        <JoinClassForm />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground/70">Module completion</h2>
        <div className="mt-3 flex flex-col gap-4">
          {modules.map((m) => (
            <div key={m.module_code}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">
                  {m.module_code} · {m.title}
                </span>
                <span className="text-foreground/50">
                  {m.lessonsRead}/{m.totalLessons} lessons
                  {m.totalChallenges > 0 && ` · ${m.challengesPassed}/${m.totalChallenges} challenges`}
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar fraction={m.totalLessons ? m.lessonsRead / m.totalLessons : 0} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-foreground/70">Challenge attempts</h2>
        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/50">No challenge attempts yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-black/10 px-4 py-2.5 text-sm dark:border-white/10"
              >
                <span className="truncate pr-4">
                  <span className="text-foreground/50">{s.module_code}</span> — {s.prompt}
                </span>
                <span
                  className={`shrink-0 font-medium ${
                    s.passed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
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
