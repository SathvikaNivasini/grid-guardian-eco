export type GridZone = "clean" | "moderate" | "critical";

export interface GridPoint {
  /** epoch ms */
  t: number;
  /** gCO2e/kWh */
  intensity: number;
  kind: "history" | "now" | "forecast";
}

export interface GridSnapshot {
  intensity: number;
  zone: GridZone;
  changePctVsHourAgo: number;
  series: GridPoint[];
  bestWindow: { start: number; end: number };
  providerLabel: string;
  simulated: boolean;
  updatedAt: number;
}

export interface DetoxSession {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMin: number;
  avgIntensity: number;
  multiplier: number;
  coins: number;
  impactPoints: number;
  avoidedCo2Kg: number;
}

export interface CityBuildingSpec {
  id: string;
  name: string;
  cost: number;
  blurb: string;
  cleanEnergy: number;
  pollution: number;
  kind:
    | "solar"
    | "wind"
    | "transit"
    | "forest"
    | "water"
    | "tower"
    | "storage";
}

export interface CityBuilding {
  instanceId: string;
  specId: string;
  builtAt: number;
  slot: number;
}

export interface UserState {
  name: string;
  coins: number;
  impactPoints: number;
  detoxMinutes: number;
  streakDays: number;
  sessions: DetoxSession[];
  buildings: CityBuilding[];
  claimedChallenges: string[];
}
