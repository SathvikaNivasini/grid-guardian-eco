import type { CityBuilding, CityBuildingSpec, UserState } from "./types";

/**
 * City Service
 * -------------------------------------------------------------
 * Catalog + purchase rules + derived city stats.
 */

export const BUILDING_CATALOG: CityBuildingSpec[] = [
  {
    id: "solar",
    name: "Solar Array",
    cost: 100,
    blurb: "Generates clean energy for your city.",
    cleanEnergy: 18,
    pollution: -12,
    kind: "solar",
  },
  {
    id: "wind",
    name: "Wind Farm",
    cost: 240,
    blurb: "Turbines harvest steady coastal wind day and night.",
    cleanEnergy: 32,
    pollution: -20,
    kind: "wind",
  },
  {
    id: "transit",
    name: "Eco Transit Hub",
    cost: 320,
    blurb: "Electric transit removes thousands of car trips.",
    cleanEnergy: 12,
    pollution: -28,
    kind: "transit",
  },
  {
    id: "forest",
    name: "Urban Forest",
    cost: 180,
    blurb: "Native canopy cools streets and captures carbon.",
    cleanEnergy: 4,
    pollution: -22,
    kind: "forest",
  },
  {
    id: "water",
    name: "Water Recycling Plant",
    cost: 280,
    blurb: "Closed-loop water cuts pumping energy sharply.",
    cleanEnergy: 8,
    pollution: -18,
    kind: "water",
  },
  {
    id: "tower",
    name: "Green Tower",
    cost: 460,
    blurb: "Net-positive housing wrapped in living facades.",
    cleanEnergy: 26,
    pollution: -24,
    kind: "tower",
  },
  {
    id: "storage",
    name: "Clean Energy Storage",
    cost: 380,
    blurb: "Shifts clean power into the evening peak.",
    cleanEnergy: 40,
    pollution: -10,
    kind: "storage",
  },
  {
    id: "garden",
    name: "Community Garden",
    cost: 120,
    blurb: "Local food production and community gathering space.",
    cleanEnergy: 2,
    pollution: -15,
    kind: "garden",
  },
  {
    id: "bike",
    name: "Bike Infrastructure",
    cost: 200,
    blurb: "Protected lanes and shared bikes replace car trips.",
    cleanEnergy: 6,
    pollution: -25,
    kind: "bike",
  },
];

export function specById(id: string) {
  return BUILDING_CATALOG.find((s) => s.id === id);
}

export interface CityStats {
  cleanEnergy: number;
  pollution: number;
  level: number;
  population: number;
  nextLevelAt: number;
}

export function cityStats(buildings: CityBuilding[]): CityStats {
  let cleanEnergy = 0;
  let pollution = 100;
  for (const b of buildings) {
    const spec = specById(b.specId);
    if (!spec) continue;
    cleanEnergy += spec.cleanEnergy;
    pollution += spec.pollution;
  }
  pollution = Math.max(0, pollution);
  const level = Math.max(1, Math.floor(cleanEnergy / 60) + 1);
  return {
    cleanEnergy,
    pollution,
    level,
    population: 1200 + buildings.length * 850,
    nextLevelAt: level * 60,
  };
}

export function canAfford(user: UserState, spec: CityBuildingSpec) {
  return user.coins >= spec.cost;
}
