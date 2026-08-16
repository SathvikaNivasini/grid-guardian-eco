import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { AlertTriangle, ArrowRight, Shield, Sparkles } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { formatCountdown } from "../services/detoxService";
import { DURATION_OPTIONS } from "../services/rewardEngine";
import { calculateReward } from "../services/rewardEngine";
import { ZONE_META } from "../services/gridService";
import { Confetti } from "../components/Confetti";

export const Route = createFileRoute("/shield")({
  head: () => ({
    meta: [
      { title: "Detox Shield — GridGuardian" },
      {
        name: "description",
        content:
          "Deploy a Detox Shield while the grid is dirty: a live countdown, dynamic grid multipliers and Eco-Coin rewards.",
      },
      { property: "og:title", content: "Detox Shield — GridGuardian" },
      {
        property: "og:description",
        content: "Put the phone down while the grid is under carbon stress and earn Eco-Coins.",
      },
    ],
  }),
  component: ShieldPage,
});

function ShieldPage() {
  const {
    grid,
    session,
    projected,
    remaining,
    progress,
    lastResult,
    startSession,
    resumeSession,
    endSession,
    clearResult,
    user,
  } = useGuardian();
  const navigate = useNavigate();

  const intensity = grid?.intensity ?? 0;
  const previews = useMemo(
    () =>
      DURATION_OPTIONS.map((d) =>
        calculateReward({ durationMin: d, intensity, streakDays: user.streakDays }),
      ),
    [intensity, user.streakDays],
  );

  useEffect(() => {
    document.title = session?.status === "running" ? "Shield active — GridGuardian" : "Detox Shield — GridGuardian";
  }, [session?.status]);

  if (lastResult) {
    return <CompleteView />;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl animate-rise">
        <h1 className="text-3xl font-semibold sm:text-4xl">Deploy your shield</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how long you'll stay off the device. Rewards scale with how dirty the grid is
          right now
          {grid ? ` (${grid.intensity} gCO₂e/kWh — ${ZONE_META[grid.zone].label.toLowerCase()})` : ""}
          .
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {previews.map((r) => (
            <button
              key={r.durationMin}
              onClick={() => startSession(r.durationMin)}
              className="glass glass-hover group p-5 text-left active:scale-[0.99]"
            >
              <div className="flex items-baseline justify-between">
                <span className="num text-2xl font-semibold">{r.durationMin} min</span>
                <span className="num rounded-full border border-border px-2.5 py-1 text-xs text-secondary">
                  {r.gridMultiplier.toFixed(1)}×
                </span>
              </div>
              <p className="num mt-3 text-lg font-semibold text-primary">
                +{r.coins} Eco-Coins
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{r.formula}</p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          This is a web MVP: switching tabs or leaving the page counts as an interruption. It
          cannot detect every form of device usage.
        </p>
      </div>
    );
  }

  const interrupted = session.status === "interrupted";
  const ringPct = Math.round(progress * 100);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 py-4">
      <div
        className="pointer-events-none absolute inset-0 grid-aura opacity-70"
        aria-hidden
      />
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
          <div
            className={`absolute inset-0 rounded-full ${interrupted ? "bg-destructive/10" : "bg-primary/10 animate-pulse-glow"}`}
          />
          <div
            className="absolute inset-2 rounded-full border border-dashed border-border animate-ring-spin"
            aria-hidden
          />
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: `conic-gradient(${
                interrupted ? "var(--color-destructive)" : "var(--color-primary)"
              } ${ringPct}%, transparent ${ringPct}% 100%)`,
              mask: "radial-gradient(circle, transparent 60%, black 61%)",
              WebkitMask: "radial-gradient(circle, transparent 60%, black 61%)",
            }}
            aria-hidden
          />
          <div className="relative flex flex-col items-center">
            <Shield
              className={`h-7 w-7 ${interrupted ? "text-destructive" : "text-primary"}`}
            />
            <p className="num mt-2 text-5xl font-semibold sm:text-6xl" aria-live="polite">
              {formatCountdown(remaining)}
            </p>
            <p
              className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${interrupted ? "text-destructive" : "text-primary"}`}
            >
              {interrupted ? "Shield interrupted" : "Grid shield active"}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {interrupted ? "Your detox session was interrupted." : "Keep the shield alive."}
        </p>
      </div>

      {interrupted && (
        <div className="glass flex flex-col items-center gap-4 p-5 text-center animate-pop">
          <AlertTriangle className="h-6 w-6 text-warning" />
          <p className="text-sm text-muted-foreground">
            Protected time is paused at {ringPct}%. Resume to keep your reward.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={resumeSession}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              Resume Shield
            </button>
            <button
              onClick={() => {
                endSession();
                navigate({ to: "/" });
              }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              End Session
            </button>
          </div>
        </div>
      )}

      <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        <MetricTile label="Current grid intensity" value={`${grid?.intensity ?? 0}`} unit="gCO₂e/kWh" />
        <MetricTile
          label="Current multiplier"
          value={`${projected?.gridMultiplier.toFixed(1) ?? "1.0"}×`}
          tone="secondary"
        />
        <MetricTile
          label="Potential reward"
          value={`+${projected?.coins ?? 0}`}
          unit="Eco-Coins"
          tone="primary"
        />
      </div>

      {projected && (
        <p className="num max-w-md text-center text-[11px] text-muted-foreground">
          {projected.formula}
        </p>
      )}

      {!interrupted && (
        <button
          onClick={endSession}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Abandon session
        </button>
      )}
    </div>
  );
}

function MetricTile({
  label,
  value,
  unit,
  tone = "default",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "default" | "primary" | "secondary";
}) {
  const toneClass =
    tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-foreground";
  return (
    <div className="glass p-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`num mt-2 text-xl font-semibold ${toneClass}`}>{value}</p>
      {unit && <p className="text-[10px] text-muted-foreground">{unit}</p>}
    </div>
  );
}

function CompleteView() {
  const { lastResult, clearResult } = useGuardian();
  if (!lastResult) return null;
  const { reward, durationMin } = lastResult;

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Confetti />
      <div className="relative flex h-40 w-40 items-center justify-center animate-pop">
        <span className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-glow" />
        <Sparkles className="h-12 w-12 text-primary" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Shield complete</h1>
      <p className="mt-2 text-sm text-muted-foreground">{durationMin} minutes protected.</p>

      <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-3">
        <div className="glass p-4">
          <p className="num text-2xl font-semibold text-primary">
            +<AnimatedNumber value={reward.coins} />
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Eco-Coins</p>
        </div>
        <div className="glass p-4">
          <p className="num text-2xl font-semibold text-secondary">
            +<AnimatedNumber value={reward.impactPoints} />
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Impact Points</p>
        </div>
        <div className="glass p-4">
          <p className="num text-2xl font-semibold text-warning">
            {reward.gridMultiplier.toFixed(1)}×
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Grid bonus</p>
        </div>
      </div>

      <p className="num mt-5 max-w-md text-xs text-muted-foreground">{reward.formula}</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        Estimated avoided CO₂ this session: {reward.avoidedCo2Kg.toFixed(3)} kg
      </p>

      <Link
        to="/city"
        onClick={clearResult}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
      >
        Return to my city <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
