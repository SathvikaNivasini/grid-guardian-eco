import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Database, RotateCcw, Radio, Zap, Globe2 } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { ZONE_THRESHOLDS, ZONE_MULTIPLIER } from "../services/gridService";
import { DEFAULT_DEVICE_WATTS } from "../services/rewardEngine";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GridGuardian" },
      {
        name: "description",
        content:
          "Grid data source, carbon-intensity thresholds, estimation assumptions and progress management for GridGuardian.",
      },
      { property: "og:title", content: "Settings — GridGuardian" },
      {
        property: "og:description",
        content: "Inspect the data source and scientific assumptions behind your rewards.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { grid, user, updateSettings, resetProgress } = useGuardian();
  const settings = user.settings;
  const [deviceWatts, setDeviceWatts] = useState(
    String(settings?.devicePowerWatts ?? DEFAULT_DEVICE_WATTS),
  );

  const handleDeviceWattsBlur = () => {
    const val = Math.max(1, Math.min(100, Number(deviceWatts) || DEFAULT_DEVICE_WATTS));
    setDeviceWatts(String(val));
    updateSettings({ devicePowerWatts: val });
  };

  return (
    <div className="max-w-2xl space-y-5 animate-rise">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Transparency about where the numbers come from.
        </p>
      </header>

      <section className="glass p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Radio className="h-4 w-4 text-secondary" /> Grid data source
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Currently: <span className="text-warning">{grid?.providerLabel ?? "loading…"}</span>
          {grid?.simulated && (
            <span className="ml-1 text-xs">(simulated)</span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => updateSettings({ gridSource: "auto" })}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              (settings?.gridSource ?? "auto") === "auto"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Auto (try live API first)
          </button>
          <button
            onClick={() => updateSettings({ gridSource: "simulation" })}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              settings?.gridSource === "simulation"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Simulation only
          </button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Auto mode fetches live carbon intensity from the UK National Grid API. If the API is
          unavailable, it falls back to a simulated provider that mirrors a realistic daily carbon
          curve. Simulation mode always uses generated data.
        </p>
      </section>

      <section className="glass p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Globe2 className="h-4 w-4 text-primary" /> Region
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Currently: <span className="text-primary">{settings?.region ?? "GB"}</span> (Great Britain)
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Live grid data is currently available for Great Britain via the UK Carbon Intensity API
          (carbonintensity.org.uk). Additional regions may be supported in future updates.
        </p>
      </section>

      <section className="glass p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Zap className="h-4 w-4 text-warning" /> Estimated device power
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Used to estimate energy and CO₂ avoided during your detox sessions.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={deviceWatts}
            onChange={(e) => setDeviceWatts(e.target.value)}
            onBlur={handleDeviceWattsBlur}
            onKeyDown={(e) => e.key === "Enter" && handleDeviceWattsBlur()}
            className="num w-24 rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-foreground"
          />
          <span className="text-sm text-muted-foreground">Watts</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Typical values: smartphone ~3–5 W, tablet ~5–10 W, laptop ~15–45 W.
          Default: {DEFAULT_DEVICE_WATTS} W. This is an estimate — actual power depends on screen
          brightness, workload, and battery state.
        </p>
      </section>

      <section className="glass p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Database className="h-4 w-4 text-primary" /> Scientific assumptions
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            Zone thresholds: Clean &lt; <span className="num text-primary">{ZONE_THRESHOLDS.clean}</span>,
            Moderate <span className="num text-warning">{ZONE_THRESHOLDS.clean}–{ZONE_THRESHOLDS.high}</span>,
            High <span className="num text-alert">{ZONE_THRESHOLDS.high}–{ZONE_THRESHOLDS.critical}</span>,
            Critical ≥ <span className="num text-destructive">{ZONE_THRESHOLDS.critical}</span> gCO₂e/kWh.
          </li>
          <li>
            Grid multipliers: {ZONE_MULTIPLIER.clean}× clean, {ZONE_MULTIPLIER.moderate}× moderate,{" "}
            {ZONE_MULTIPLIER.high}× high, {ZONE_MULTIPLIER.critical}× critical.
          </li>
          <li>Streak bonuses: +10% at 3 days, +20% at 7 days, +35% at 14 days.</li>
          <li>
            Avoided CO₂ = device power (currently {settings?.devicePowerWatts ?? DEFAULT_DEVICE_WATTS} W)
            × duration ÷ 1000 × grid intensity. This is an estimate.
          </li>
          <li>
            EcoCoins are a gamification layer — they do not represent literal carbon savings.
            The scientific impact estimate and the game reward are separate.
          </li>
          <li>Progress is stored locally in this browser.</li>
        </ul>
      </section>

      <section className="glass p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <RotateCcw className="h-4 w-4 text-destructive" /> Reset
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Clears coins, sessions, city and challenge progress. Settings are preserved.
        </p>
        <button
          onClick={resetProgress}
          className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Reset my progress
        </button>
      </section>
    </div>
  );
}
