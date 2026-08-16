import type { UserState } from "./types";

export interface Challenge {
  id: string;
  icon: string;
  name: string;
  description: string;
  reward: string;
  rewardCoins: number;
  goal: number;
  progress: (user: UserState) => number;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "beat-the-peak",
    icon: "🔥",
    name: "Beat the Peak",
    description: "Complete 3 detoxes during high-carbon periods.",
    reward: "+300 Eco-Coins",
    rewardCoins: 300,
    goal: 3,
    progress: (u) => u.sessions.filter((s) => s.avgIntensity >= 400).length,
  },
  {
    id: "green-streak",
    icon: "🌱",
    name: "Green Streak",
    description: "Detox for 7 consecutive days.",
    reward: "Rare City Tree + 200 Eco-Coins",
    rewardCoins: 200,
    goal: 7,
    progress: (u) => u.streakDays,
  },
  {
    id: "grid-guardian",
    icon: "⚡",
    name: "Grid Guardian",
    description: "Complete 10 total detox sessions.",
    reward: "Exclusive infrastructure + 500 Eco-Coins",
    rewardCoins: 500,
    goal: 10,
    progress: (u) => u.sessions.length,
  },
  {
    id: "century",
    icon: "🕒",
    name: "Century Shield",
    description: "Protect the grid for 100 total detox minutes.",
    reward: "+250 Eco-Coins",
    rewardCoins: 250,
    goal: 100,
    progress: (u) => u.detoxMinutes,
  },
];

export function challengeState(challenge: Challenge, user: UserState) {
  const progress = Math.min(challenge.goal, challenge.progress(user));
  const complete = progress >= challenge.goal;
  const claimed = user.claimedChallenges.includes(challenge.id);
  return { progress, complete, claimed, ratio: progress / challenge.goal };
}
