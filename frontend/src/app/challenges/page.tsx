import { getChallenges, groupByModule } from "@/lib/challenges/queries";
import { MODULES, moduleTitle } from "@/lib/learn/modules";
import QuizChallenge from "@/components/challenges/QuizChallenge";
import CircuitChallenge from "@/components/challenges/CircuitChallenge";

export default async function ChallengesPage() {
  const challenges = await getChallenges();
  const byModule = groupByModule(challenges);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Challenges</h1>
      <p className="mt-1 text-foreground/70">
        Quizzes and circuit challenges, one module at a time.
      </p>

      <div className="mt-8 flex flex-col gap-10">
        {MODULES.map((mod) => {
          const moduleChallenges = byModule.get(mod.code) ?? [];
          if (moduleChallenges.length === 0) return null;

          return (
            <section key={mod.code}>
              <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                {mod.code}
              </span>
              <h2 className="text-xl font-semibold">{moduleTitle(mod, "en")}</h2>

              <div className="mt-4 flex flex-col gap-4">
                {moduleChallenges.map((challenge) =>
                  challenge.grading_rule.type === "quiz" ? (
                    <QuizChallenge key={challenge.id} challenge={challenge} />
                  ) : (
                    <CircuitChallenge key={challenge.id} challenge={challenge} />
                  )
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
