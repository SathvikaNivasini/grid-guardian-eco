import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bolt,
  Building2,
  Clock,
  Coins,
  Crown,
  Flame,
  Leaf,
  Lock,
  Moon,
  Shield,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { badgeProgress, TIER_LABEL, type BadgeProgress } from "../services/badgeService";

export const Route = createFileRoute("/badges")({
  head: () => ({
    meta: [
      { title: "Badges & Achievements — GridGuardian" },
      {
        name: "description",
        content:
          "Unlock badges for streaks, screen-free hours, dirty-grid saves and the green city you build.",
      },
      { property: "og:title", content: "Badges & Achievements — GridGuardian" },
      {
        property: "og:description",
        content: "Every badge is one more piece of the planet you personally protected.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BadgesPage,
});

const ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  flame: Flame,
  clock: Clock,
  leaf: Leaf,
  bolt: Bolt,
  coins: Coins,
  city: Building2,
  crown: Crown,
  moon: Moon,
};

const TIER_CLASS: Record<string, string> = {
  bronze: "text-warning",
  silver: "text-secondary",
  gold: "text-primary",
  legend: "text-destructive",
};

function BadgesPage() {
  const { user } = useGuardian();
  const all = badgeProgress(user);
  const earned = all.filter((b) => b.earned);
  const locked = all.filter((b) => !b.earned);

  return (
    <div className="space-y-6 animate-rise">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">Your badges</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Badges are proof of the pollution you personally prevented. Each one tells you exactly
          what to do to earn it — no mystery, no fine print.
        </p>
      </header>

      <section className="glass flex flex-wrap items-center gap-6 p-5 sm:p-6">
        <div>
          <p className="num text-3xl font-semibold text-primary">
            {earned.length}
            <span className="text-lg text-muted-foreground">/{all.length}</span>
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Badges unlocked
          </p>
        </div>
        <div className="h-10 w-px bg-border" />
        <p className="max-w-md text-sm text-muted-foreground">
          <Sparkles className="mr-1.5 inline h-4 w-4 text-warning" />
          Closest badge:{" "}
          <span className="font-semibold text-foreground">
            {locked.length ? nearest(locked).def.name : "all done — you legend"}
          </span>
          {locked.length ? ` — ${locked.length} still to go.` : ""}
        </p>
      </section>

      {earned.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Unlocked
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {earned.map((b) => (
              <BadgeCard key={b.def.id} badge={b} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Still to unlock
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {locked.map((b) => (
            <BadgeCard key={b.def.id} badge={b} />
          ))}
        </div>
      </section>

      <Link
        to="/guide"
        className="inline-block rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
      >
        New here? Read how to play
      </Link>
    </div>
  );
}

function nearest(list: BadgeProgress[]) {
  return list.reduce((best, b) => (b.progress > best.progress ? b : best), list[0]!);
}

function BadgeCard({ badge }: { badge: BadgeProgress }) {
  const Icon = ICONS[badge.def.icon] ?? Shield;
  const decimals = badge.def.target < 10 && badge.def.target % 1 !== 0 ? 2 : 0;
  return (
    <article
      className={[
        "glass glass-hover relative overflow-hidden p-5",
        badge.earned ? "ring-1 ring-primary/50" : "opacity-95",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <span
          className={[
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent",
            badge.earned ? "" : "grayscale",
          ].join(" ")}
        >
          <Icon className={`h-5 w-5 ${TIER_CLASS[badge.def.tier]}`} />
          {badge.earned && (
            <span className="absolute inset-0 animate-pulse-glow rounded-2xl bg-primary/10" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{badge.def.name}</h3>
            {!badge.earned && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {TIER_LABEL[badge.def.tier]}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{badge.def.how}</p>

          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700"
                style={{ width: `${Math.round(badge.progress * 100)}%` }}
              />
            </div>
            <p className="num mt-1.5 text-[11px] text-muted-foreground">
              {badge.value.toFixed(decimals)} / {badge.def.target} {badge.def.unit}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
