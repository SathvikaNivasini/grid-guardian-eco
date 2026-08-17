import { zoneOf, ZONE_MULTIPLIER } from "./gridService";

export const DURATION_OPTIONS = [5, 10, 15, 30] as const;
export type DurationMin = (typeof DURATION_OPTIONS)[number];

export const DEFAULT_DEVICE_WATTS = 5;

const BASE_BY_DURATION: Record<number, number> = { 5: 40, 10: 90, 15: 150, 30: 350 };

export function baseCoins(durationMin: number): number {
  if (BASE_BY_DURATION[durationMin] != null) return BASE_BY_DURATION[durationMin];
  return Math.round(durationMin * 11);
}

export function gridMultiplier(intensity: number): number {
  return ZONE_MULTIPLIER[zoneOf(intensity)];
}

export function streakBonus(streakDays: number): number {
  if (streakDays >= 14) return 0.35;
  if (streakDays >= 7) return 0.2;
  if (streakDays >= 3) return 0.1;
  return 0;
}

export function estimateAvoidedCo2Kg(
  durationMin: number,
  intensity: number,
  deviceWatts = DEFAULT_DEVICE_WATTS,
): number {
  const kWh = (deviceWatts / 1000) * (durationMin / 60);
  return (kWh * intensity) / 1000;
}

export function estimateAvoidedWh(durationMin: number, deviceWatts = DEFAULT_DEVICE_WATTS): number {
  return deviceWatts * (durationMin / 60);
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
  avoidedWh: number;
  formula: string;
}

export function calculateReward(input: {
  durationMin: number;
  intensity: number;
  streakDays: number;
  deviceWatts?: number;
}): RewardBreakdown {
  const dw = input.deviceWatts ?? DEFAULT_DEVICE_WATTS;
  const base = baseCoins(input.durationMin);
  const gm = gridMultiplier(input.intensity);
  const sb = streakBonus(input.streakDays);
  const afterGrid = base * gm;
  const streakCoins = Math.round(afterGrid * sb);
  const coins = Math.round(afterGrid) + streakCoins;
  const impactPoints = Math.round(input.durationMin * 3 * gm);
  const formula =
    `${base} base × ${gm.toFixed(1)} grid` +
    (sb > 0 ? ` + ${Math.round(sb * 100)}% streak` : "") +
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
    avoidedCo2Kg: estimateAvoidedCo2Kg(input.durationMin, input.intensity, dw),
    avoidedWh: estimateAvoidedWh(input.durationMin, dw),
    formula,
  };
}
