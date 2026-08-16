import type { UserState } from "./types";

/**
 * User Service
 * -------------------------------------------------------------
 * Profile, streak, level and derived statistics.
 */

export interface LevelDef {
  level: number;
  title: string;
  minMinutes: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, title: "Observer", minMinutes: 0 },
  { level: 2, title: "Guardian", minMinutes: 60 },
  { level: 3, title: "Protector", minMinutes: 180 },
  { level: 4, title: "Grid Keeper", minMinutes: 420 },
  { level: 5, title: "Earth Guardian", minMinutes: 900 },
];

export function levelFor(detoxMinutes: number) {
  let current: LevelDef = LEVELS[0]!;

  for (const l of LEVELS) if (detoxMinutes >= l.minMinutes) current = l;
  const next = LEVELS.find((l) => l.level === current.level + 1);
  const span = next ? next.minMinutes - current.minMinutes : 1;
  const progress = next
    ? Math.min(1, (detoxMinutes - current.minMinutes) / span)
    : 1;
  return { current, next, progress };
}

export function totalAvoidedCo2Kg(user: UserState) {
  return user.sessions.reduce((sum, s) => sum + s.avoidedCo2Kg, 0);
}

export function bestSession(user: UserState) {
  return user.sessions.reduce<UserState["sessions"][number] | null>(
    (best, s) => (!best || s.coins > best.coins ? s : best),
    null,
  );
}

export function dayKey(t: number) {
  return new Date(t).toISOString().slice(0, 10);
}

/** Recompute streak from session history (consecutive calendar days). */
export function computeStreak(sessions: UserState["sessions"], now = Date.now()) {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dayKey(s.endedAt)));
  let streak = 0;
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    if (!days.has(dayKey(cursor.getTime()))) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function initialUser(): UserState {
  return {
    name: "Guardian",
    coins: 320,
    impactPoints: 0,
    detoxMinutes: 0,
    streakDays: 0,
    sessions: [],
    buildings: [],
    claimedChallenges: [],
  };
}
