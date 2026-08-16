import type { GridPoint, GridSnapshot, GridZone } from "./types";

/**
 * Grid Service
 * -------------------------------------------------------------
 * Owns carbon-intensity data: current value, history, forecast.
 * `MockGridProvider` simulates a live feed. To use a real API,
 * implement `GridProvider` and swap it in `gridService`.
 */

export interface GridProvider {
  label: string;
  simulated: boolean;
  snapshot(now: number): GridSnapshot;
}

export const ZONE_THRESHOLDS = { clean: 200, critical: 400 } as const;

export function zoneOf(intensity: number): GridZone {
  if (intensity < ZONE_THRESHOLDS.clean) return "clean";
  if (intensity < ZONE_THRESHOLDS.critical) return "moderate";
  return "critical";
}

export const ZONE_META: Record<
  GridZone,
  { label: string; note: string; token: "primary" | "warning" | "destructive" }
> = {
  clean: {
    label: "CLEAN GRID",
    note: "The grid is running clean right now — low-carbon electricity is abundant.",
    token: "primary",
  },
  moderate: {
    label: "MODERATE STRESS",
    note: "Grid carbon intensity is currently elevated.",
    token: "warning",
  },
  critical: {
    label: "CRITICAL STRESS",
    note: "Fossil peaking plants are covering demand. Every watt counts.",
    token: "destructive",
  },
};

/** Smooth pseudo-noise so the simulated feed is continuous, not jumpy. */
function noise(seedTime: number, scaleMinutes: number, seed: number) {
  const x = seedTime / (scaleMinutes * 60_000) + seed * 13.37;
  return (
    (Math.sin(x) + Math.sin(x * 0.53 + 1.7) * 0.6 + Math.sin(x * 0.21 + 4.2) * 0.4) / 2
  );
}

/** Daily shape: cleaner overnight/midday (solar), dirty at evening peak. */
function dailyShape(t: number) {
  const d = new Date(t);
  const hour = d.getHours() + d.getMinutes() / 60;
  const eveningPeak = Math.exp(-((hour - 18.5) ** 2) / 5) * 190;
  const morningPeak = Math.exp(-((hour - 7.5) ** 2) / 4) * 90;
  const solarDip = -Math.exp(-((hour - 13) ** 2) / 8) * 95;
  return 285 + eveningPeak + morningPeak + solarDip;
}

export function simulatedIntensityAt(t: number): number {
  const value =
    dailyShape(t) + noise(t, 55, 1) * 70 + noise(t, 13, 2) * 30 + noise(t, 4, 3) * 12;
  return Math.round(Math.min(620, Math.max(70, value)));
}

const HISTORY_HOURS = 8;
const FORECAST_HOURS = 3;
const STEP_MS = 15 * 60_000;

class MockGridProvider implements GridProvider {
  label = "SIMULATED GRID DATA";
  simulated = true;

  snapshot(now: number): GridSnapshot {
    const anchor = Math.floor(now / STEP_MS) * STEP_MS;
    const series: GridPoint[] = [];

    for (let t = anchor - HISTORY_HOURS * 3_600_000; t < anchor; t += STEP_MS) {
      series.push({ t, intensity: simulatedIntensityAt(t), kind: "history" });
    }
    const intensity = simulatedIntensityAt(now);
    series.push({ t: now, intensity, kind: "now" });
    for (let i = 1; i <= (FORECAST_HOURS * 3_600_000) / STEP_MS; i++) {
      const t = anchor + i * STEP_MS;
      series.push({ t, intensity: simulatedIntensityAt(t), kind: "forecast" });
    }

    const hourAgo = simulatedIntensityAt(now - 3_600_000);
    const changePctVsHourAgo = Math.round(((intensity - hourAgo) / hourAgo) * 100);

    // Best detox window = the dirtiest upcoming 25 minutes (highest reward).
    let best = { start: now, end: now + 25 * 60_000, value: -1 };
    for (let m = 0; m <= 180; m += 5) {
      const start = now + m * 60_000;
      const value =
        (simulatedIntensityAt(start) + simulatedIntensityAt(start + 25 * 60_000)) / 2;
      if (value > best.value) best = { start, end: start + 25 * 60_000, value };
    }

    return {
      intensity,
      zone: zoneOf(intensity),
      changePctVsHourAgo,
      series,
      bestWindow: { start: best.start, end: best.end },
      providerLabel: this.label,
      simulated: this.simulated,
      updatedAt: now,
    };
  }
}

export const gridProvider: GridProvider = new MockGridProvider();

export function getGridSnapshot(now = Date.now()): GridSnapshot {
  return gridProvider.snapshot(now);
}

export function formatClock(t: number) {
  return new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
