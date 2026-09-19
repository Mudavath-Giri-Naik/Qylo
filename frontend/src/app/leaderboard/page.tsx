import { createClient } from "@/lib/supabase/server";
import { getDashboardOverview } from "@/lib/dashboard/queries";
import LeaderboardBoard from "@/components/leaderboard/LeaderboardBoard";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let you = { points: 0, challenges: 0, circuits: 0 };
  if (user) {
    const overview = await getDashboardOverview(user.id);
    you = {
      points: overview.challengesSolved * 250 + overview.circuitsBuilt * 60,
      challenges: overview.challengesSolved,
      circuits: overview.circuitsBuilt,
    };
  }

  return <LeaderboardBoard you={you} loggedIn={!!user} />;
}
