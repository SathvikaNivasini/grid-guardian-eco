import { createFileRoute } from "@tanstack/react-router";
import { Check, Gift, Target } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { CHALLENGES, challengeState } from "../services/challengeService";
import { getDailyMissions, missionState } from "../services/missionService";
import { Confetti } from "../components/Confetti";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges & Missions — GridGuardian" },
      {
        name: "description",
        content:
          "Daily missions and lifetime challenges. Complete them to earn Eco-Coins and unlock city upgrades.",
      },
      { property: "og:title", content: "Challenges & Missions — GridGuardian" },
      {
        property: "og:description",
        content: "Gamified environmental challenges tied to real grid carbon intensity.",
      },
    ],
  }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const { user, claimChallenge, claimDailyMission } = useGuardian();
  const missions = getDailyMissions();

  const anyClaimable = CHALLENGES.some((c) => {
    const s = challengeState(c, user);
    return s.complete && !s.claimed;
  });
  const anyMissionClaimable = missions.some((m) => {
    const s = missionState(m, user);
    return s.complete && !s.claimed;
  });

  return (
    <div className="relative space-y-6 animate-rise">
      {(anyClaimable || anyMissionClaimable) && <Confetti count={24} />}

      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">Challenges & Missions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete daily missions and lifetime challenges to earn bonus Eco-Coins.
        </p>
      </header>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold mb-4">
          <Target className="h-4 w-4 text-secondary" /> Today's Guardian Missions
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {missions.map((m) => {
            const s = missionState(m, user);
            return (
              <article
                key={m.id}
                className={`glass glass-hover p-5 ${s.complete && !s.claimed ? "shadow-[var(--shadow-glow)]" : ""} ${s.claimed ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden>{m.icon}</span>
                    <div>
                      <h3 className={`text-base font-semibold ${s.claimed ? "line-through text-muted-foreground" : ""}`}>
                        {m.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                  {s.claimed && (
                    <span className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-primary">
                      <Check className="h-3 w-3" /> Done
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="num">{s.progress} / {m.goal}</span>
                    <span className="num text-primary">+{m.rewardCoins} Eco-Coins</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        s.complete ? "bg-primary animate-pulse-glow" : "bg-gradient-to-r from-primary to-secondary"
                      }`}
                      style={{ width: `${Math.round(s.ratio * 100)}%` }}
                    />
                  </div>
                </div>

                {s.complete && !s.claimed && (
                  <button
                    onClick={() => claimDailyMission(m.id, m.rewardCoins)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <Gift className="h-4 w-4" /> Claim reward
                  </button>
                )}
              </article>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Missions reset daily at midnight.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-4">Lifetime Challenges</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {CHALLENGES.map((c) => {
            const s = challengeState(c, user);
            return (
              <article
                key={c.id}
                className={`glass glass-hover p-5 ${s.complete && !s.claimed ? "shadow-[var(--shadow-glow)]" : ""} ${s.claimed ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden>
                      {c.icon}
                    </span>
                    <div>
                      <h2 className="text-base font-semibold">{c.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    </div>
                  </div>
                  {s.claimed && (
                    <span className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-primary">
                      <Check className="h-3 w-3" /> Claimed
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="num">
                      {s.progress} / {c.goal}
                    </span>
                    <span className="num text-primary">{c.reward}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        s.complete ? "bg-primary animate-pulse-glow" : "bg-gradient-to-r from-primary to-secondary"
                      }`}
                      style={{ width: `${Math.round(s.ratio * 100)}%` }}
                    />
                  </div>
                </div>

                {s.complete && !s.claimed && (
                  <button
                    onClick={() => claimChallenge(c.id, c.rewardCoins)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <Gift className="h-4 w-4" /> Claim reward
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
