import type { GridPoint, GridSnapshot, GridZone } from "./types";

export interface GridProvider {
  label: string;
  simulated: boolean;
  snapshot(now: number): GridSnapshot;
}

export const ZONE_THRESHOLDS = { clean: 150, high: 300, critical: 450 } as const;

export function zoneOf(intensity: number): GridZone {
  if (intensity < ZONE_THRESHOLDS.clean) return "clean";
  if (intensity < ZONE_THRESHOLDS.high) return "moderate";
  if (intensity < ZONE_THRESHOLDS.critical) return "high";
  return "critical";
}

export const ZONE_META: Record<
  GridZone,
  { label: string; note: string; token: "primary" | "warning" | "alert" | "destructive" }
> = {
  clean: {
    label: "CLEAN GRID",
    note: "The grid is running clean right now — low-carbon electricity is abundant.",
    token: "primary",
  },
  moderate: {
    label: "MODERATE STRESS",
    note: "Grid carbon intensity is elevated. A good time to start thinking about a detox.",
    token: "warning",
  },
  high: {
    label: "HIGH STRESS",
    note: "Fossil plants are ramping up. Detoxing now makes a real difference.",
    token: "alert",
  },
  critical: {
    label: "GRID CRITICAL",
    note: "Fossil peaking plants are covering demand. Every watt counts — maximum rewards active.",
    token: "destructive",
  },
};

export const ZONE_MULTIPLIER: Record<GridZone, number> = {
  clean: 1,
  moderate: 1.5,
  high: 2,
  critical: 3,
};

function noise(seedTime: number, scaleMinutes: number, seed: number) {
  const x = seedTime / (scaleMinutes * 60_000) + seed * 13.37;
  return (
    (Math.sin(x) + Math.sin(x * 0.53 + 1.7) * 0.6 + Math.sin(x * 0.21 + 4.2) * 0.4) / 2
  );
}

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

function findBestWindow(
  now: number,
  intensityFn: (t: number) => number,
  lookAheadMin = 180,
) {
  let best = { start: now, end: now + 25 * 60_000, value: -1 };
  for (let m = 0; m <= lookAheadMin; m += 5) {
    const start = now + m * 60_000;
    const value = (intensityFn(start) + intensityFn(start + 25 * 60_000)) / 2;
    if (value > best.value) best = { start, end: start + 25 * 60_000, value };
  }
  return { start: best.start, end: best.end };
}

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

    return {
      intensity,
      zone: zoneOf(intensity),
      changePctVsHourAgo,
      series,
      bestWindow: findBestWindow(now, simulatedIntensityAt),
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

interface CarbonIntensityEntry {
  from: string;
  to: string;
  intensity: {
    forecast: number;
    actual: number | null;
    index: string;
  };
}

export async function fetchLiveGridData(region = "GB"): Promise<GridSnapshot | null> {
  try {
    const now = Date.now();
    const [currentRes, dayRes] = await Promise.all([
      fetch("https://api.carbonintensity.org.uk/intensity", { signal: AbortSignal.timeout(8000) }),
      fetch(
        `https://api.carbonintensity.org.uk/intensity/date/${new Date().toISOString().slice(0, 10)}`,
        { signal: AbortSignal.timeout(8000) },
      ),
    ]);

    if (!currentRes.ok || !dayRes.ok) return null;

    const currentJson = (await currentRes.json()) as { data: CarbonIntensityEntry[] };
    const dayJson = (await dayRes.json()) as { data: CarbonIntensityEntry[] };

    const currentEntry = currentJson.data[0];
    if (!currentEntry) return null;

    const intensity = currentEntry.intensity.actual ?? currentEntry.intensity.forecast;

    const series: GridPoint[] = [];
    const dayData = dayJson.data;
    const nowTime = now;

    for (const entry of dayData) {
      const t = new Date(entry.from).getTime();
      const val = entry.intensity.actual ?? entry.intensity.forecast;
      const kind: GridPoint["kind"] =
        t > nowTime ? "forecast" : t === nowTime ? "now" : "history";
      series.push({ t, intensity: val, kind });
    }

    const nowIdx = series.findIndex((p) => p.t >= nowTime);
    if (nowIdx >= 0) {
      const closest = series[nowIdx];
      if (closest) closest.kind = "now";
    }

    for (let i = 0; i < series.length; i++) {
      const point = series[i];
      if (point && nowIdx >= 0 && i > nowIdx) {
        point.kind = "forecast";
      }
    }

    const hourAgoTime = now - 3_600_000;
    const hourAgoEntry = series.reduce<GridPoint | null>((best, p) => {
      if (p.t <= hourAgoTime && (!best || p.t > best.t)) return p;
      return best;
    }, null);
    const hourAgoIntensity = hourAgoEntry?.intensity ?? intensity;
    const changePctVsHourAgo =
      hourAgoIntensity > 0 ? Math.round(((intensity - hourAgoIntensity) / hourAgoIntensity) * 100) : 0;

    const forecastPoints = series.filter((p) => p.kind === "forecast");
    let bestWindow = { start: now, end: now + 25 * 60_000 };
    if (forecastPoints.length >= 2) {
      let bestVal = -1;
      for (let i = 0; i < forecastPoints.length - 1; i++) {
        const fp = forecastPoints[i]!;
        const fpNext = forecastPoints[i + 1];
        const val = fpNext ? (fp.intensity + fpNext.intensity) / 2 : fp.intensity;
        if (val > bestVal) {
          bestVal = val;
          bestWindow = { start: fp.t, end: fpNext?.t ?? fp.t + 30 * 60_000 };
        }
      }
    }

    return {
      intensity,
      zone: zoneOf(intensity),
      changePctVsHourAgo,
      series,
      bestWindow,
      providerLabel: "UK NATIONAL GRID (LIVE)",
      simulated: false,
      updatedAt: now,
      region,
    };
  } catch {
    return null;
  }
}
