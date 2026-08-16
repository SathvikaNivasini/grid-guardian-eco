import { calculateReward, type RewardBreakdown } from "./rewardEngine";
import type { DetoxSession } from "./types";

/**
 * Detox Service
 * -------------------------------------------------------------
 * Session lifecycle: create -> tick -> interrupt -> complete.
 * Pure logic only; timers and storage live in the state layer.
 */

export type DetoxStatus = "idle" | "running" | "interrupted" | "complete";

export interface ActiveSession {
  id: string;
  durationMin: number;
  startedAt: number;
  /** ms of protected time already banked (excludes paused time) */
  elapsedMs: number;
  lastTickAt: number;
  status: DetoxStatus;
  intensitySamples: number[];
}

export function createSession(durationMin: number, intensity: number, now = Date.now()): ActiveSession {
  return {
    id: `s_${now.toString(36)}`,
    durationMin,
    startedAt: now,
    elapsedMs: 0,
    lastTickAt: now,
    status: "running",
    intensitySamples: [intensity],
  };
}

export function remainingMs(session: ActiveSession) {
  return Math.max(0, session.durationMin * 60_000 - session.elapsedMs);
}

export function progressOf(session: ActiveSession) {
  return Math.min(1, session.elapsedMs / (session.durationMin * 60_000));
}

export function averageIntensity(session: ActiveSession) {
  if (session.intensitySamples.length === 0) return 0;
  const sum = session.intensitySamples.reduce((a, b) => a + b, 0);
  return Math.round(sum / session.intensitySamples.length);
}

export function projectedReward(session: ActiveSession, streakDays: number): RewardBreakdown {
  return calculateReward({
    durationMin: session.durationMin,
    intensity: averageIntensity(session),
    streakDays,
  });
}

export function finalizeSession(
  session: ActiveSession,
  reward: RewardBreakdown,
  now = Date.now(),
): DetoxSession {
  return {
    id: session.id,
    startedAt: session.startedAt,
    endedAt: now,
    durationMin: session.durationMin,
    avgIntensity: reward.intensity,
    multiplier: reward.gridMultiplier,
    coins: reward.coins,
    impactPoints: reward.impactPoints,
    avoidedCo2Kg: reward.avoidedCo2Kg,
  };
}

export function formatCountdown(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
