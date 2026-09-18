import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/queries";
import JoinClassForm from "@/components/dashboard/JoinClassForm";
import ModuleCompletionChart from "@/components/dashboard/ModuleCompletionChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { modules, submissions } = await getDashboardData(user.id);

  const chartData = modules.map((m) => ({
    module: m.module_code,
    lessons: m.totalLessons ? Math.round((m.lessonsRead / m.totalLessons) * 100) : 0,
    challenges: m.totalChallenges ? Math.round((m.challengesPassed / m.totalChallenges) * 100) : 0,
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome{user.email ? `, ${user.email}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">Your progress across every module.</p>
        </div>
        <JoinClassForm />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Module completion</CardTitle>
          <CardDescription>Percent of lessons read and challenges passed, per module.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 && <ModuleCompletionChart data={chartData} />}

          <div className="flex flex-col gap-5">
            {modules.map((m) => (
              <div key={m.module_code}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {m.module_code} · {m.title}
                  </span>
                  <span className="text-muted-foreground">
                    {m.lessonsRead}/{m.totalLessons} lessons
                    {m.totalChallenges > 0 && ` · ${m.challengesPassed}/${m.totalChallenges} challenges`}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[var(--chart-1)] transition-all"
                    style={{
                      width: `${Math.round(Math.min(1, m.totalLessons ? m.lessonsRead / m.totalLessons : 0) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Challenge attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No challenge attempts yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {submissions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm"
                >
                  <span className="truncate pr-4 text-foreground">
                    <span className="text-muted-foreground">{s.module_code}</span> — {s.prompt}
                  </span>
                  <Badge variant={s.passed ? "default" : "destructive"} className="shrink-0">
                    {s.passed ? "Passed" : "Not yet"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
