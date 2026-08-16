import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Flame, Info, Medal, TrendingUp } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { leaderboard, yourRank } from "../services/leaderboardService";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "World Leaderboard — GridGuardian" },
      {
        name: "description",
        content:
          "See how your screen-free minutes and avoided emissions rank against Guardians around the world.",
      },
      { property: "og:title", content: "World Leaderboard — GridGuardian" },
      {
        property: "og:description",
        content: "Climb the ranks by putting your phone down when the grid is dirtiest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { user } = useGuardian();
  const rows = leaderboard(user);
  const rank = yourRank(user);
  const podium = rows.slice(0, 3);

  return (
    <div className="space-y-6 animate-rise">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">World leaderboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Guardians everywhere are switching off at the exact moments the power grid is at its
          dirtiest. Every minute here is a minute of pollution that never happened.
        </p>
      </header>

      {/* Your standing, in plain English */}
      <section className="glass relative overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-accent">
              <span className="num text-2xl font-semibold text-primary">#{rank.rank}</span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                of {rank.total}
              </span>
            </span>
            <div>
              <p className="text-lg font-semibold">
                You&apos;re #{rank.rank} in the world right now
              </p>
              <p className="text-xs text-muted-foreground">
                Rank: {rank.title} · {user.streakDays} day streak
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 p-4 text-sm">
            {rank.nextName ? (
              <p>
                <TrendingUp className="mr-2 inline h-4 w-4 text-primary" />
                Just{" "}
                <span className="num font-semibold text-primary">{rank.minutesToNext} more
                minutes</span>{" "}
                offline and you overtake <span className="font-semibold">{rank.nextName}</span>.
              </p>
            ) : (
              <p>
                <Crown className="mr-2 inline h-4 w-4 text-warning" />
                You are #1 on Earth. Everyone else is chasing you.
              </p>
            )}
            <Link
              to="/shield"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Deploy a shield now
            </Link>
          </div>
        </div>
      </section>

      {/* Podium */}
      <section className="grid gap-3 sm:grid-cols-3">
        {podium.map((row, i) => (
          <div
            key={row.id}
            className={[
              "glass glass-hover flex items-center gap-4 p-5",
              row.isYou ? "ring-1 ring-primary/60" : "",
            ].join(" ")}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              {i === 0 ? (
                <Crown className="h-5 w-5 text-warning" />
              ) : (
                <Medal className="h-5 w-5 text-secondary" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {row.isYou ? "You" : row.name}
              </p>
              <p className="num text-xs text-primary">
                {Math.round(row.minutes / 60)} h {row.minutes % 60} m offline
              </p>
              <p className="text-[11px] text-muted-foreground">{row.country}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Full table with human-readable headings */}
      <section className="glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-base font-semibold">Everyone, ranked by time offline</h2>
          <span className="text-[11px] text-muted-foreground">Simulated community</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">Guardian</th>
                <th className="px-3 py-3 font-medium">Time offline</th>
                <th className="px-3 py-3 font-medium">Pollution stopped</th>
                <th className="px-5 py-3 font-medium">Streak</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={[
                    "border-b border-border/60 transition-colors",
                    row.isYou ? "bg-accent/70" : "hover:bg-accent/40",
                  ].join(" ")}
                >
                  <td className="num px-5 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-3">
                    <span className={row.isYou ? "font-semibold text-primary" : "font-medium"}>
                      {row.isYou ? "You" : row.name}
                    </span>
                    <span className="ml-2 text-[11px] text-muted-foreground">{row.country}</span>
                  </td>
                  <td className="num px-3 py-3">
                    {Math.floor(row.minutes / 60)}h {row.minutes % 60}m
                  </td>
                  <td className="num px-3 py-3 text-secondary">{row.co2Kg.toFixed(2)} kg CO₂</td>
                  <td className="px-5 py-3">
                    <span className="num inline-flex items-center gap-1 text-warning">
                      <Flame className="h-3.5 w-3.5" />
                      {row.streakDays}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass p-5 text-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Info className="h-4 w-4 text-primary" />
          What do these columns actually mean?
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="font-medium">Time offline</dt>
            <dd className="mt-1 text-xs text-muted-foreground">
              Total minutes this Guardian kept their device down inside a shield session. More
              minutes = less electricity pulled from the grid.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Pollution stopped</dt>
            <dd className="mt-1 text-xs text-muted-foreground">
              Estimated CO₂ that was never released, because the electricity you would have used
              was never generated.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Streak</dt>
            <dd className="mt-1 text-xs text-muted-foreground">
              Days in a row with at least one completed shield. Streaks add bonus Eco-Coins.
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Your own totals are real and stored on this device. Rival Guardians are simulated until
          community accounts are switched on.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/badges"
          className="rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          See your badges
        </Link>
        <Link
          to="/guide"
          className="rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          How to play
        </Link>
      </div>
    </div>
  );
}
