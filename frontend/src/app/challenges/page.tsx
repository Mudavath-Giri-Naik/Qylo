import { createClient } from "@/lib/supabase/server";
import { getChallenges, getPassedChallengeIds } from "@/lib/challenges/queries";
import { getDashboardOverview, type StreakDay } from "@/lib/dashboard/queries";
import ChallengesBoard, { type ChallengerEntry } from "@/components/challenges/ChallengesBoard";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Sample community leaderboard, scoped to challenge points -- there's no
// real cross-user ranking system yet, so this mirrors the same placeholder
// approach already used on /leaderboard and the dashboard.
const SAMPLE_CHALLENGERS: ChallengerEntry[] = [
  { name: "Arjun Mehta", points: 2430 },
  { name: "Priya Sharma", points: 2120 },
  { name: "Liam Chen", points: 1980 },
  { name: "Sophia Martinez", points: 1760 },
];
const COMMUNITY_SIZE = 86;

function emptyWeeklyStreak(): StreakDay[] {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return {
      label: DAY_LABELS[day.getDay()],
      active: false,
      isToday: day.toDateString() === today.toDateString(),
    };
  });
}

export default async function ChallengesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const challenges = await getChallenges();

  let passedIds: string[] = [];
  let streakDays = 0;
  let weeklyStreak: StreakDay[] = emptyWeeklyStreak();
  let challengesSolved = 0;
  let yourPoints = 0;
  let pointsThisWeek = 0;

  if (user) {
    const [passed, overview] = await Promise.all([getPassedChallengeIds(user.id), getDashboardOverview(user.id)]);
    passedIds = Array.from(passed);
    streakDays = overview.streakDays;
    weeklyStreak = overview.weeklyStreak;
    challengesSolved = overview.challengesSolved;
    yourPoints = overview.challengesSolved * 250 + overview.circuitsBuilt * 60;
    pointsThisWeek = overview.challengesThisWeek * 250;
  }

  const ranked = [...SAMPLE_CHALLENGERS, { name: "You", points: yourPoints }].sort((a, b) => b.points - a.points);
  const rank = ranked.findIndex((entry) => entry.name === "You") + 1;

  return (
    <ChallengesBoard
      challenges={challenges}
      passedIds={passedIds}
      streakDays={streakDays}
      weeklyStreak={weeklyStreak}
      challengesSolved={challengesSolved}
      totalChallenges={challenges.length}
      yourPoints={yourPoints}
      pointsThisWeek={pointsThisWeek}
      rank={rank}
      totalRanked={COMMUNITY_SIZE}
      topChallengers={SAMPLE_CHALLENGERS}
    />
  );
}
