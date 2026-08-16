import { createFileRoute } from "@tanstack/react-router";
import { Flame, Coins, Building2, Timer, Shield } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { LEVELS, levelFor } from "../services/userService";
import { cityStats } from "../services/cityService";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Guardian Profile — GridGuardian" },
      {
        name: "description",
        content:
          "Your Guardian level, streak, Eco-Coin balance and city progression across every detox session.",
      },
      { property: "og:title", content: "Guardian Profile — GridGuardian" },
      {
        property: "og:description",
        content: "Progress from Observer to Earth Guardian by protecting the grid.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useGuardian();
  const { current, next, progress } = levelFor(user.detoxMinutes);
  const stats = cityStats(user.buildings);

  return (
    <div className="space-y-6 animate-rise">
      <section className="glass grid-aura p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
            <Shield className="h-8 w-8 text-primary" />
            <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse-glow" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{user.name}</h1>
            <p className="mt-1 text-sm text-primary">
              Level {current.level} — {current.title}
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{current.title}</span>
            <span>{next ? `${next.minMinutes - user.detoxMinutes} min to ${next.title}` : "Max level"}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Tile icon={<Flame className="h-4 w-4" />} label="Current streak" value={user.streakDays} suffix=" days" />
        <Tile icon={<Coins className="h-4 w-4" />} label="Total Eco-Coins" value={user.coins} tone="primary" />
        <Tile icon={<Building2 className="h-4 w-4" />} label="City level" value={stats.level} tone="secondary" />
        <Tile icon={<Timer className="h-4 w-4" />} label="Detox minutes" value={user.detoxMinutes} />
        <Tile icon={<Shield className="h-4 w-4" />} label="Sessions" value={user.sessions.length} />
      </div>

      <section className="glass p-5 sm:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Progression
        </h2>
        <ol className="mt-4 space-y-2.5">
          {LEVELS.map((l) => {
            const unlocked = user.detoxMinutes >= l.minMinutes;
            return (
              <li
                key={l.level}
                className={`flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors ${
                  unlocked ? "bg-accent/50" : "opacity-60"
                }`}
              >
                <span className={unlocked ? "text-foreground" : "text-muted-foreground"}>
                  Level {l.level} — {l.title}
                </span>
                <span className="num text-[11px] text-muted-foreground">{l.minMinutes} min</span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Tile({
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
