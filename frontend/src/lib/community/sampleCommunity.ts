// Shared illustrative community data used across Challenges, Leaderboard, My
// Progress and Community -- there's no real multi-tenant community backend
// yet (submissions/circuits are private per-user under RLS), so this mirrors
// the same sample-leaderboard approach already used across those pages,
// kept in one place so the names/points stay consistent everywhere they
// appear.
export interface CommunityMember {
  name: string;
  institution: string;
  country: string;
  points: number;
  challenges: number;
  circuits: number;
  badgeColors: string[];
}

export const SAMPLE_COMMUNITY: CommunityMember[] = [
  { name: "Arjun Mehta", institution: "IISc Bangalore", country: "India", points: 2430, challenges: 86, circuits: 124, badgeColors: ["#f6b93b", "#8e6ff7", "#4b8bf5"] },
  { name: "Priya Sharma", institution: "IIT Delhi", country: "India", points: 2120, challenges: 78, circuits: 110, badgeColors: ["#f6b93b", "#8e6ff7", "#ec6cb9"] },
  { name: "Liam Chen", institution: "MIT", country: "USA", points: 1980, challenges: 72, circuits: 98, badgeColors: ["#f6b93b", "#4b8bf5", "#ec6cb9"] },
  { name: "Sophia Martinez", institution: "Stanford", country: "USA", points: 1760, challenges: 68, circuits: 90, badgeColors: ["#8e6ff7", "#ec6cb9", "#34c77b"] },
  { name: "Karthik Reddy", institution: "NIT Trichy", country: "India", points: 1210, challenges: 50, circuits: 70, badgeColors: ["#4b8bf5", "#ec6cb9"] },
  { name: "Emma Wilson", institution: "ETH Zurich", country: "Switzerland", points: 1180, challenges: 48, circuits: 66, badgeColors: ["#4b8bf5", "#34c77b"] },
  { name: "Noah Kim", institution: "University of Tokyo", country: "Japan", points: 1050, challenges: 42, circuits: 60, badgeColors: ["#4b8bf5", "#ec6cb9"] },
  { name: "Isabella Rossi", institution: "Politecnico di Milano", country: "Italy", points: 980, challenges: 40, circuits: 56, badgeColors: ["#4b8bf5", "#34c77b"] },
  { name: "Carlos Mendez", institution: "University of Toronto", country: "Canada", points: 920, challenges: 38, circuits: 52, badgeColors: ["#8e6ff7", "#34c77b"] },
];

export const COMMUNITY_TOTAL_MEMBERS = 12480;
export const COMMUNITY_TOTAL_COUNTRIES = 42;

export interface RankedMember {
  name: string;
  institution: string;
  country: string;
  points: number;
  challenges: number;
  circuits: number;
  badgeColors: string[];
  isYou: boolean;
}

export function rankWithYou(you: { points: number; challenges: number; circuits: number }): RankedMember[] {
  const all: RankedMember[] = [
    ...SAMPLE_COMMUNITY.map((m) => ({ ...m, isYou: false })),
    {
      name: "You",
      institution: "MVGR College",
      country: "India",
      points: you.points,
      challenges: you.challenges,
      circuits: you.circuits,
      badgeColors: ["#8e6ff7", "#4b8bf5"],
      isYou: true,
    },
  ];
  return all.sort((a, b) => b.points - a.points);
}
