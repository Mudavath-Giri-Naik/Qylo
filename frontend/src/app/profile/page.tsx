import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getDashboardOverview } from "@/lib/dashboard/queries";
import { buildAchievements } from "@/lib/dashboard/achievements";
import { getFirstCircuitDate } from "@/lib/dashboard/insights";
import { rankWithYou } from "@/lib/community/sampleCommunity";
import ProfileView from "@/components/profile/ProfileView";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profileRow }, { modules, submissions }, overview, firstCircuitAt] = await Promise.all([
    supabase.from("users").select("role, preferred_language").eq("id", user.id).single(),
    getDashboardData(user.id),
    getDashboardOverview(user.id),
    getFirstCircuitDate(user.id),
  ]);

  const coursesCompleted = modules.filter((m) => m.totalLessons > 0 && m.lessonsRead >= m.totalLessons).length;
  const points = overview.challengesSolved * 250 + overview.circuitsBuilt * 60;
  const ranked = rankWithYou({ points, challenges: overview.challengesSolved, circuits: overview.circuitsBuilt });
  const rank = ranked.findIndex((m) => m.isYou) + 1;
  const percentile = Math.max(1, Math.round((rank / ranked.length) * 100));

  const lastSolvedAt = submissions.find((s) => s.passed)?.timestamp ?? null;
  const achievements = buildAchievements({
    circuitsBuilt: overview.circuitsBuilt,
    firstCircuitAt,
    challengesSolved: overview.challengesSolved,
    lastSolvedAt,
    streakDays: overview.streakDays,
  });

  return (
    <ProfileView
      userId={user.id}
      email={user.email ?? ""}
      role={profileRow?.role ?? null}
      preferredLanguage={profileRow?.preferred_language ?? "en"}
      memberSince={user.created_at}
      modules={modules}
      submissions={submissions}
      overview={overview}
      coursesCompleted={coursesCompleted}
      points={points}
      rank={rank}
      percentile={percentile}
      achievements={achievements}
      firstCircuitAt={firstCircuitAt}
      lastSolvedAt={lastSolvedAt}
    />
  );
}
