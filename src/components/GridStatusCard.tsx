import { ArrowDownRight, ArrowUpRight, Clock, Radio, AlertTriangle } from "lucide-react";

import { AnimatedNumber } from "./AnimatedNumber";
import { ZONE_META, formatClock } from "../services/gridService";
import type { GridSnapshot } from "../services/types";

const zoneAccent = {
  primary: "text-primary",
  warning: "text-warning",
  alert: "text-alert",
  destructive: "text-destructive",
} as const;

const zoneDot = {
  primary: "bg-primary",
  warning: "bg-warning",
  alert: "bg-alert",
  destructive: "bg-destructive",
} as const;

function meterPct(intensity: number) {
  return Math.min(98, Math.max(2, (intensity / 620) * 100));
}

export function GridStatusCard({ grid }: { grid: GridSnapshot }) {
  const meta = ZONE_META[grid.zone];
  const accent = zoneAccent[meta.token];
  const up = grid.changePctVsHourAgo >= 0;

  return (
    <section className="glass grid-aura relative overflow-hidden p-6 sm:p-8 animate-rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Grid status
          </p>
          <div className="mt-3 flex items-end gap-3">
            <AnimatedNumber
              value={grid.intensity}
              className={`num text-6xl font-semibold leading-none sm:text-7xl ${accent}`}
            />
            <span className="pb-1 text-sm text-muted-foreground">gCO₂e/kWh</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${zoneDot[meta.token]} animate-pulse-glow`} />
            <span className={`text-sm font-semibold tracking-[0.12em] ${accent}`}>
              {meta.label}
            </span>
          </div>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{meta.note}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <Radio className="h-3 w-3 animate-shimmer text-secondary" />
            {grid.providerLabel}
          </span>
          {grid.stale && (
            <span className="flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[10px] font-medium text-warning">
              <AlertTriangle className="h-3 w-3" />
              STALE DATA
            </span>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="relative h-2.5 w-full rounded-full bg-muted">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/70 via-warning/60 via-[60%] to-destructive/70 opacity-70" />
          <div
            className="absolute -top-1 h-4.5 w-4.5 -translate-x-1/2 rounded-full border-2 border-background bg-foreground shadow-[0_0_18px_2px_var(--color-ring)] transition-[left] duration-1000 ease-out"
            style={{ left: `${meterPct(grid.intensity)}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-2.5 flex justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span>Clean</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Critical</span>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/50 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Grid intensity
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm">
            {up ? (
              <ArrowUpRight className="h-4 w-4 text-destructive" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-primary" />
            )}
            <span className={`num font-semibold ${up ? "text-destructive" : "text-primary"}`}>
              {up ? "+" : ""}
              {grid.changePctVsHourAgo}%
            </span>
            <span className="text-muted-foreground">compared with 1 hour ago</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Best detox window
          </p>
          <p className="num mt-2 flex items-center gap-2 text-sm font-semibold text-secondary">
            <Clock className="h-4 w-4" />
            {formatClock(grid.bestWindow.start)} – {formatClock(grid.bestWindow.end)}
          </p>
        </div>
      </div>
    </section>
  );
}
