import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Coins, Building2, Flame, Leaf, Zap, Target } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { GridStatusCard } from "../components/GridStatusCard";
import { GridChart } from "../components/GridChart";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { calculateReward } from "../services/rewardEngine";
import { ZONE_META, ZONE_MULTIPLIER, formatClock } from "../services/gridService";
import { cityStats } from "../services/cityService";
import { levelFor, totalAvoidedCo2Kg } from "../services/userService";
import { getDailyMissions, missionState } from "../services/missionService";
import { estimateAvoidedWh } from "../services/rewardEngine";
import { Confetti } from "../components/Confetti";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GridGuardian — Detox when the grid is dirty" },
      {
        name: "description",
        content:
          "GridGuardian turns live electricity-grid carbon intensity into a digital detox game: shield the grid, earn Eco-Coins and grow a clean-energy city.",
      },
      { property: "og:title", content: "GridGuardian — Detox when the grid is dirty" },
      {
        property: "og:description",
        content:
          "See what the grid is doing, detox at the dirtiest moments, earn Eco-Coins and build your Eco-City.",
      },
    ],
  }),
  component: Overview,
});

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Overview() {
  const { grid, user, hydrated, claimDailyMission } = useGuardian();
  const stats = cityStats(user.buildings);
  const { current } = levelFor(user.detoxMinutes);
  const avoided = totalAvoidedCo2Kg(user);
  const totalWh = user.sessions.reduce(
    (sum, s) => sum + estimateAvoidedWh(s.durationMin, user.settings?.devicePowerWatts ?? 5),
    0,
  );

  const preview = grid
    ? calculateReward({
        durationMin: 15,
        intensity: grid.intensity,
        streakDays: user.streakDays,
        deviceWatts: user.settings?.devicePowerWatts ?? 5,
      })
    : null;

  const missions = getDailyMissions();

  const zoneMultiplier = grid ? ZONE_MULTIPLIER[grid.zone] : 1;
  const isUrgent = grid && (grid.zone === "high" || grid.zone === "critical");

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {greeting()}, {user.name}.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isUrgent
            ? "The grid needs you right now. Detox to protect your city."
            : "The grid is changing. Your actions can change with it."}
        </p>
      </header>

      {!hydrated || !grid ? (
        <Skeletons />
      ) : (
        <>
          <GridStatusCard grid={grid} />

          <section
            className={`glass overflow-hidden p-6 sm:p-8 animate-rise ${
              isUrgent ? "grid-aura border-destructive/30" : "grid-aura"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-lg">
                <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
                  <Shield className="h-5 w-5 text-primary" />
                  {isUrgent ? "Grid Emergency" : "Deploy Detox Shield"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {ZONE_META[grid.zone].note} A 15-minute detox right now earns:
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="num rounded-full bg-primary/15 px-3 py-1.5 text-sm font-semibold text-primary">
                    +{preview?.coins ?? 0} Eco-Coins
                  </span>
                  <span className="num rounded-full bg-secondary/15 px-3 py-1.5 text-sm font-semibold text-secondary">
                    {zoneMultiplier.toFixed(1)}× Grid Bonus
                  </span>
                  {user.streakDays >= 3 && (
                    <span className="num rounded-full bg-warning/15 px-3 py-1.5 text-sm font-semibold text-warning">
                      +{Math.round((preview?.streakBonus ?? 0) * 100)}% Streak
                    </span>
                  )}
                </div>
                <p className="num mt-3 text-[11px] text-muted-foreground">{preview?.formula}</p>
              </div>

              <Link
                to="/shield"
                className={`group inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03] active:scale-95 ${
                  isUrgent
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isUrgent ? "PROTECT THE GRID" : "ACTIVATE SHIELD"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="mt-5 text-[11px] text-muted-foreground">
              Best window today: {formatClock(grid.bestWindow.start)} –{" "}
              {formatClock(grid.bestWindow.end)} — that's when the grid is dirtiest and your
              multiplier peaks.
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashStat
              icon={<Zap className="h-4 w-4" />}
              label="Grid"
              value={`${grid.intensity}`}
              sub={`gCO₂e/kWh · ${ZONE_META[grid.zone].label}`}
              tone="primary"
            />
            <DashStat
              icon={<Shield className="h-4 w-4" />}
              label="Detox"
              value={`${user.detoxMinutes}`}
              sub="minutes today"
              tone="secondary"
            />
            <DashStat
              icon={<Leaf className="h-4 w-4" />}
              label="Impact"
              value={`${totalWh.toFixed(1)}`}
              sub={`Wh avoided · ~${(avoided * 1000).toFixed(1)} g CO₂e`}
            />
            <DashStat
              icon={<Building2 className="h-4 w-4" />}
              label="City"
              value={`Level ${stats.level}`}
              sub={`${Math.round((stats.cleanEnergy / stats.nextLevelAt) * 100)}% to next`}
              tone="warning"
            />
          </section>

          <section className="glass p-5 sm:p-6 animate-rise">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-secondary" /> Today's Guardian Missions
              </h2>
              <span className="num text-[11px] text-muted-foreground">
                {missions.filter((m) => missionState(m, user).complete).length}/{missions.length} complete
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {missions.map((m) => {
                const state = missionState(m, user);
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      state.claimed
                        ? "border-primary/20 bg-primary/5"
                        : state.complete
                          ? "border-primary/40 bg-primary/10"
                          : "border-border bg-surface/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.icon}</span>
                        <div>
                          <p className={`text-sm font-semibold ${state.claimed ? "text-muted-foreground line-through" : ""}`}>
                            {m.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                      {state.complete && !state.claimed && (
                        <>
                          <Confetti />
                          <button
                            onClick={() => claimDailyMission(m.id, m.rewardCoins)}
                            className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
                          >
                            +{m.rewardCoins}
                          </button>
                        </>
                      )}
                      {state.claimed && (
                        <span className="text-xs text-primary font-medium">Claimed</span>
                      )}
                    </div>
                    {!state.claimed && (
                      <div className="mt-3">
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${Math.min(100, state.ratio * 100)}%` }}
                          />
                        </div>
                        <p className="num mt-1 text-[10px] text-muted-foreground">
                          {state.progress} / {m.goal}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <GridChart grid={grid} />

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat
              icon={<Coins className="h-4 w-4" />}
              label="Eco-Coins"
              value={user.coins}
              tone="primary"
            />
            <MiniStat
              icon={<Flame className="h-4 w-4" />}
              label="Streak"
              value={user.streakDays}
              suffix=" days"
            />
            <MiniStat
              icon={<Building2 className="h-4 w-4" />}
              label="City level"
              value={stats.level}
              tone="secondary"
            />
            <MiniStat
              icon={<Shield className="h-4 w-4" />}
              label={current.title}
              value={user.detoxMinutes}
              suffix=" min"
            />
          </section>

          <section className="glass p-5 sm:p-6 animate-rise">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              The loop
            </h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                { n: "01", t: "Watch the grid", d: "Live carbon intensity, updated continuously." },
                { n: "02", t: "Detox on cue", d: "Shield up when the grid is dirtiest." },
                { n: "03", t: "Earn Eco-Coins", d: "Rewards scale with real grid stress." },
                { n: "04", t: "Grow your city", d: "Spend coins on clean infrastructure." },
              ].map((s) => (
                <li key={s.n} className="rounded-xl border border-border bg-surface/50 p-4">
                  <span className="num text-[11px] text-primary">{s.n}</span>
                  <p className="mt-1.5 text-sm font-semibold">{s.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}

function DashStat({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "primary" | "secondary" | "warning";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
        ? "text-secondary"
        : tone === "warning"
          ? "text-warning"
          : "text-foreground";
  return (
    <div className="glass glass-hover p-4">
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={`num mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tone?: "primary" | "secondary";
}) {
  const toneClass =
    tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-foreground";
  return (
    <div className="glass glass-hover p-4">
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={`num mt-2 text-2xl font-semibold ${toneClass}`}>
        <AnimatedNumber value={value} suffix={suffix ?? ""} />
      </p>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="glass h-72 animate-shimmer" />
      <div className="glass h-40 animate-shimmer" />
      <div className="glass h-72 animate-shimmer" />
    </div>
  );
}
