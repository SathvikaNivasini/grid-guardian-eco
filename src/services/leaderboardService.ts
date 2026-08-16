import type { UserState } from "./types";
import { levelFor, totalAvoidedCo2Kg } from "./userService";

/**
 * Leaderboard Service
 * -------------------------------------------------------------
 * The rival Guardians are simulated (no backend yet) but they are
 * deterministic, so the ranking never jumps around between renders.
 */

export interface LeaderboardEntry {
  id: string;
  name: string;
  country: string;
  minutes: number;
  co2Kg: number;
  streakDays: number;
  isYou: boolean;
}

interface Rival {
  name: string;
  country: string;
  minutes: number;
  streakDays: number;
}

const RIVALS: Rival[] = [
  { name: "Maya R.", country: "🇮🇳 India", minutes: 1840, streakDays: 21 },
  { name: "Tobias L.", country: "🇩🇪 Germany", minutes: 1520, streakDays: 16 },
  { name: "Aiko S.", country: "🇯🇵 Japan", minutes: 1275, streakDays: 12 },
  { name: "Noor A.", country: "🇦🇪 UAE", minutes: 980, streakDays: 9 },
  { name: "Diego M.", country: "🇧🇷 Brazil", minutes: 760, streakDays: 7 },
  { name: "Freya K.", country: "🇩🇰 Denmark", minutes: 615, streakDays: 6 },
  { name: "Sam O.", country: "🇺🇸 USA", minutes: 430, streakDays: 4 },
  { name: "Lina P.", country: "🇿🇦 South Africa", minutes: 295, streakDays: 3 },
  { name: "Yusuf E.", country: "🇹🇷 Türkiye", minutes: 180, streakDays: 2 },
  { name: "Chen W.", country: "🇸🇬 Singapore", minutes: 95, streakDays: 1 },
];

/** Rough CO₂ estimate for a rival so the table stays internally consistent. */
function rivalCo2(minutes: number) {
  return (12 / 1000) * (minutes / 60) * 380 * 0.001 * 1000;
}

export function leaderboard(user: UserState): LeaderboardEntry[] {
  const you: LeaderboardEntry = {
    id: "you",
    name: user.name || "You",
    country: "🌍 Your city",
    minutes: user.detoxMinutes,
    co2Kg: totalAvoidedCo2Kg(user),
    streakDays: user.streakDays,
    isYou: true,
  };
  const rest = RIVALS.map((r, i) => ({
    id: `r${i}`,
    name: r.name,
    country: r.country,
    minutes: r.minutes,
    co2Kg: rivalCo2(r.minutes),
    streakDays: r.streakDays,
    isYou: false,
  }));
  return [...rest, you].sort((a, b) => b.minutes - a.minutes);
}

export function yourRank(user: UserState) {
  const rows = leaderboard(user);
  const index = rows.findIndex((r) => r.isYou);
  const ahead = rows[index - 1];
  return {
    rank: index + 1,
    total: rows.length,
    /** Minutes needed to overtake the Guardian directly above you. */
    minutesToNext: ahead ? Math.max(1, ahead.minutes - user.detoxMinutes + 1) : 0,
    nextName: ahead?.name ?? null,
    title: levelFor(user.detoxMinutes).current.title,
  };
}

/**
 * Real-world equivalents. Turns abstract grams of CO₂ into
 * things a human can actually picture.
 */
export function realWorldEquivalents(co2Kg: number) {
  return [
    {
      label: "kilometres of car driving avoided",
      value: co2Kg / 0.17,
      decimals: 1,
      emoji: "🚗",
      note: "An average petrol car emits about 170 g of CO₂ per km.",
    },
    {
      label: "phone charges' worth of emissions",
      value: co2Kg / 0.008,
      decimals: 0,
      emoji: "🔌",
      note: "One full smartphone charge is roughly 8 g of CO₂.",
    },
    {
      label: "days of a young tree absorbing carbon",
      value: co2Kg / 0.0575,
      decimals: 1,
      emoji: "🌳",
      note: "A young tree absorbs about 21 kg of CO₂ per year.",
    },
    {
      label: "cups of tea boiled",
      value: co2Kg / 0.02,
      decimals: 0,
      emoji: "🫖",
      note: "Boiling one mug of water is around 20 g of CO₂.",
    },
  ];
}
