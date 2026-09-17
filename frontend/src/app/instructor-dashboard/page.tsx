import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getInstructorClasses, getClassDashboard } from "@/lib/instructor/queries";
import CreateClassForm from "@/components/instructor/CreateClassForm";

export default async function InstructorDashboardPage({
  searchParams,
}: PageProps<"/instructor-dashboard">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const classes = await getInstructorClasses(user.id);
  const resolvedSearchParams = await searchParams;
  const classParam = Array.isArray(resolvedSearchParams.class)
    ? resolvedSearchParams.class[0]
    : resolvedSearchParams.class;
  const selectedClass = classes.find((c) => c.id === classParam) ?? classes[0] ?? null;

  const dashboard = selectedClass ? await getClassDashboard(selectedClass.id) : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome{user.email ? `, ${user.email}` : ""}
          </h1>
          <p className="mt-1 text-foreground/60">Manage your classes and see how students are doing.</p>
        </div>
        <CreateClassForm />
      </div>

      {classes.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/50">
          You don&apos;t have a class yet — create one above to get a join code for your students.
        </p>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {classes.map((c) => (
              <Link
                key={c.id}
                href={`/instructor-dashboard?class=${c.id}`}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  selectedClass?.id === c.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-black/10 dark:border-white/15"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {selectedClass && (
            <div className="mt-2 text-sm text-foreground/60">
              Join code: <span className="font-mono font-semibold">{selectedClass.join_code}</span>
            </div>
          )}

          {dashboard && dashboard.moduleAverageScore.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-foreground/70">Class average score by module</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {dashboard.moduleAverageScore.map((m) => (
                  <div
                    key={m.module_code}
                    className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/10"
                  >
                    <span className="font-medium">{m.module_code}</span>{" "}
                    <span className="text-foreground/60">
                      {m.average.toFixed(0)}% avg ({m.count} submission{m.count === 1 ? "" : "s"})
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-foreground/70">Roster</h2>
            {!dashboard || dashboard.roster.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/50">
                No students have joined this class yet. Share the join code above.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-foreground/50 dark:border-white/10">
                      <th className="py-2 pr-4">Student</th>
                      {dashboard.roster[0].moduleCompletion.map((m) => (
                        <th key={m.module_code} className="py-2 pr-4">
                          {m.module_code}
                        </th>
                      ))}
                      <th className="py-2">Stuck on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.roster.map((student) => (
                      <tr key={student.student_id} className="border-b border-black/5 dark:border-white/5">
                        <td className="py-2.5 pr-4">{student.email}</td>
                        {student.moduleCompletion.map((m) => (
                          <td key={m.module_code} className="py-2.5 pr-4 text-foreground/70">
                            {Math.round(m.fraction * 100)}%
                          </td>
                        ))}
                        <td className="py-2.5">
                          {student.stuckOn.length === 0 ? (
                            <span className="text-foreground/40">—</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {student.stuckOn.map((s) => (
                                <span
                                  key={s.challenge_id}
                                  className="w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400"
                                  title={s.prompt}
                                >
                                  {s.attempts} attempts, 0 passed
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
