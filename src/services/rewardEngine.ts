/**
 * Reward Engine
 * -------------------------------------------------------------
 * Pure functions: duration base -> grid multiplier -> streak bonus.
 * The UI never hardcodes a reward; it always renders these results.
 */

export const DURATION_OPTIONS = [5, 10, 15, 30] as const;
export type DurationMin = (typeof DURATION_OPTIONS)[number];

const BASE_BY_DURATION: Record<number, number> = { 5: 40, 10: 90, 15: 150, 30: 350 };

export function baseCoins(durationMin: number): number {
  if (BASE_BY_DURATION[durationMin] != null) return BASE_BY_DURATION[durationMin];
  // Linear-ish fallback for arbitrary durations.
  return Math.round(durationMin * 11);
}

export function gridMultiplier(intensity: number): number {
  if (intensity < 200) return 1;
  if (intensity < 400) return 1.5;
  return 3;
}

export function streakBonus(streakDays: number): number {
  if (streakDays >= 14) return 0.35;
  if (streakDays >= 7) return 0.2;
  if (streakDays >= 3) return 0.1;
  return 0;
}

/** Watts assumed saved by putting a device down, used for CO2 estimation. */
const ASSUMED_DEVICE_WATTS = 12;

export function estimateAvoidedCo2Kg(durationMin: number, intensity: number): number {
  const kWh = (ASSUMED_DEVICE_WATTS / 1000) * (durationMin / 60);
  return (kWh * intensity) / 1000;
}

export interface RewardBreakdown {
  durationMin: number;
  intensity: number;
  base: number;
  gridMultiplier: number;
  streakDays: number;
  streakBonus: number;
  streakCoins: number;
  coins: number;
  impactPoints: number;
  avoidedCo2Kg: number;
  formula: string;
}

export function calculateReward(input: {
  durationMin: number;
  intensity: number;
  streakDays: number;
}): RewardBreakdown {
  const base = baseCoins(input.durationMin);
  const gm = gridMultiplier(input.intensity);
  const sb = streakBonus(input.streakDays);
  const afterGrid = base * gm;
  const streakCoins = Math.round(afterGrid * sb);
  const coins = Math.round(afterGrid) + streakCoins;
  const impactPoints = Math.round(input.durationMin * 3 * gm);
  const formula =
    `${base} base coins × ${gm.toFixed(1)} grid multiplier` +
    (sb > 0 ? ` + ${Math.round(sb * 100)}% streak bonus` : "") +
    ` = ${coins} Eco-Coins`;

  return {
    durationMin: input.durationMin,
    intensity: input.intensity,
    base,
    gridMultiplier: gm,
    streakDays: input.streakDays,
    streakBonus: sb,
    streakCoins,
    coins,
    impactPoints,
    avoidedCo2Kg: estimateAvoidedCo2Kg(input.durationMin, input.intensity),
    formula,
  };
}
