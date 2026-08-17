import type { UserState } from "./types";
import { dayKey } from "./userService";

export interface DailyMission {
  id: string;
  icon: string;
  name: string;
  description: string;
  rewardCoins: number;
  goal: number;
  progress: (user: UserState) => number;
}

const MISSION_POOL: DailyMission[] = [
  {
    id: "m-5min",
    icon: "🛡️",
    name: "Quick Shield",
    description: "Complete a 5-minute detox session.",
    rewardCoins: 50,
    goal: 1,
    progress: (u) => todaySessions(u).filter((s) => s.durationMin >= 5).length,
  },
  {
    id: "m-15min",
    icon: "⏱️",
    name: "Focused Detox",
    description: "Complete a 15-minute detox session.",
    rewardCoins: 120,
    goal: 1,
    progress: (u) => todaySessions(u).filter((s) => s.durationMin >= 15).length,
  },
  {
    id: "m-30min",
    icon: "🏆",
    name: "Marathon Shield",
    description: "Complete a 30-minute detox session.",
    rewardCoins: 200,
    goal: 1,
    progress: (u) => todaySessions(u).filter((s) => s.durationMin >= 30).length,
  },
  {
    id: "m-peak",
    icon: "🔴",
    name: "Peak Hunter",
    description: "Detox during a high or critical grid alert.",
    rewardCoins: 150,
    goal: 1,
    progress: (u) => todaySessions(u).filter((s) => s.avgIntensity >= 300).length,
  },
  {
    id: "m-2sess",
    icon: "✌️",
    name: "Double Shield",
    description: "Complete 2 detox sessions today.",
    rewardCoins: 100,
    goal: 2,
    progress: (u) => todaySessions(u).length,
  },
  {
    id: "m-3sess",
    icon: "🎯",
    name: "Triple Threat",
    description: "Complete 3 detox sessions today.",
    rewardCoins: 180,
    goal: 3,
    progress: (u) => todaySessions(u).length,
  },
  {
    id: "m-30total",
    icon: "⏰",
    name: "Half Hour Hero",
    description: "Bank 30 minutes of detox time today.",
    rewardCoins: 120,
    goal: 30,
    progress: (u) => todaySessions(u).reduce((sum, s) => sum + s.durationMin, 0),
  },
  {
    id: "m-45total",
    icon: "🕐",
    name: "Extended Guard",
    description: "Bank 45 minutes of detox time today.",
    rewardCoins: 160,
    goal: 45,
    progress: (u) => todaySessions(u).reduce((sum, s) => sum + s.durationMin, 0),
  },
  {
    id: "m-streak",
    icon: "🔥",
    name: "Keep the Flame",
    description: "Maintain your detox streak (any session today).",
    rewardCoins: 80,
    goal: 1,
    progress: (u) => todaySessions(u).length > 0 ? 1 : 0,
  },
  {
    id: "m-200coins",
    icon: "💰",
    name: "Big Earner",
    description: "Earn 200+ Eco-Coins in a single session.",
    rewardCoins: 100,
    goal: 1,
    progress: (u) => todaySessions(u).filter((s) => s.coins >= 200).length,
  },
  {
    id: "m-critical",
    icon: "⚡",
    name: "Crisis Responder",
    description: "Detox during a critical grid alert (3× multiplier).",
    rewardCoins: 200,
    goal: 1,
    progress: (u) => todaySessions(u).filter((s) => s.multiplier >= 3).length,
  },
  {
    id: "m-build",
    icon: "🏗️",
    name: "City Planner",
    description: "Build something in your Eco-City today.",
    rewardCoins: 100,
    goal: 1,
    progress: (u) => {
      const today = dayKey(Date.now());
      return u.buildings.filter((b) => dayKey(b.builtAt) === today).length;
    },
  },
];

function todaySessions(user: UserState) {
  const today = dayKey(Date.now());
  return user.sessions.filter((s) => dayKey(s.endedAt) === today);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getDailyMissions(date = new Date()): DailyMission[] {
  const key = dayKey(date.getTime());
  const shuffled = seededShuffle(MISSION_POOL, dateSeed(key));
  return shuffled.slice(0, 4);
}

export function missionState(mission: DailyMission, user: UserState) {
  const progress = Math.min(mission.goal, mission.progress(user));
  const complete = progress >= mission.goal;
  const claimed = user.claimedDailyMissions.includes(mission.id);
  return { progress, complete, claimed, ratio: progress / mission.goal };
}
