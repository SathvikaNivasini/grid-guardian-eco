import type { UserState } from "./types";
import { totalAvoidedCo2Kg } from "./userService";

/**
 * Badge Service
 * -------------------------------------------------------------
 * Human-readable achievements. Each badge knows how to measure
 * its own progress from the user state, so the UI never guesses.
 */

export type BadgeTier = "bronze" | "silver" | "gold" | "legend";

export interface BadgeDef {
  id: string;
  name: string;
  /** Plain-English "what do I do to get this". */
  how: string;
  tier: BadgeTier;
  icon:
    | "shield"
    | "flame"
    | "clock"
    | "leaf"
    | "bolt"
    | "coins"
    | "city"
    | "crown"
    | "moon";
  target: number;
  /** Current progress value, same unit as target. */
  measure: (u: UserState) => number;
  /** How to render the numbers, e.g. "3 / 7 days". */
  unit: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-shield",
    name: "First Light",
    how: "Finish your very first shield session.",
    tier: "bronze",
    icon: "shield",
    target: 1,
    unit: "session",
    measure: (u) => u.sessions.length,
  },
  {
    id: "ten-shields",
    name: "Habit Forming",
    how: "Complete 10 shield sessions in total.",
    tier: "silver",
    icon: "shield",
    target: 10,
    unit: "sessions",
    measure: (u) => u.sessions.length,
  },
  {
    id: "streak-3",
    name: "Three in a Row",
    how: "Put your phone down at least once a day for 3 days straight.",
    tier: "bronze",
    icon: "flame",
    target: 3,
    unit: "day streak",
    measure: (u) => u.streakDays,
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    how: "Keep your streak alive for a full week.",
    tier: "gold",
    icon: "flame",
    target: 7,
    unit: "day streak",
    measure: (u) => u.streakDays,
  },
  {
    id: "hour-offline",
    name: "One Hour Offline",
    how: "Bank 60 minutes of protected, screen-free time.",
    tier: "bronze",
    icon: "clock",
    target: 60,
    unit: "minutes",
    measure: (u) => u.detoxMinutes,
  },
  {
    id: "ten-hours",
    name: "Ten Hours Reclaimed",
    how: "Bank 600 minutes of screen-free time.",
    tier: "gold",
    icon: "clock",
    target: 600,
    unit: "minutes",
    measure: (u) => u.detoxMinutes,
  },
  {
    id: "peak-hunter",
    name: "Peak Hunter",
    how: "Finish 3 sessions while the grid was dirty (3× multiplier).",
    tier: "silver",
    icon: "bolt",
    target: 3,
    unit: "dirty-grid sessions",
    measure: (u) => u.sessions.filter((s) => s.multiplier >= 3).length,
  },
  {
    id: "co2-half",
    name: "Carbon Cutter",
    how: "Avoid half a kilogram of CO₂ through your detox habit.",
    tier: "silver",
    icon: "leaf",
    target: 0.5,
    unit: "kg CO₂ avoided",
    measure: (u) => totalAvoidedCo2Kg(u),
  },
  {
    id: "coins-2000",
    name: "Coin Collector",
    how: "Earn 2,000 Eco-Coins in total rewards.",
    tier: "silver",
    icon: "coins",
    target: 2000,
    measure: (u) => u.coins + u.buildings.length * 0, // current balance
    unit: "Eco-Coins",
  },
  {
    id: "city-5",
    name: "City Planner",
    how: "Build 5 pieces of green infrastructure in your Eco-City.",
    tier: "gold",
    icon: "city",
    target: 5,
    unit: "buildings",
    measure: (u) => u.buildings.length,
  },
  {
    id: "long-haul",
    name: "The Long Haul",
    how: "Complete a single 30-minute shield without breaking it.",
    tier: "gold",
    icon: "moon",
    target: 1,
    unit: "30-min session",
    measure: (u) => u.sessions.filter((s) => s.durationMin >= 30).length,
  },
  {
    id: "legend",
    name: "Planet Legend",
    how: "Reach 1,500 minutes offline. Very few Guardians get here.",
    tier: "legend",
    icon: "crown",
    target: 1500,
    unit: "minutes",
    measure: (u) => u.detoxMinutes,
  },
];

export interface BadgeProgress {
  def: BadgeDef;
  value: number;
  progress: number;
  earned: boolean;
}

export function badgeProgress(user: UserState): BadgeProgress[] {
  return BADGES.map((def) => {
    const value = def.measure(user);
    return {
      def,
      value,
      progress: Math.min(1, def.target === 0 ? 1 : value / def.target),
      earned: value >= def.target,
    };
  });
}

export function earnedCount(user: UserState) {
  return badgeProgress(user).filter((b) => b.earned).length;
}

export const TIER_LABEL: Record<BadgeTier, string> = {
  bronze: "Starter",
  silver: "Serious",
  gold: "Elite",
  legend: "Legendary",
};
