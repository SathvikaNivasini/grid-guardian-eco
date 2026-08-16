import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Coins, Flame, Shield, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "How GridGuardian Works — Beginner's Guide" },
      {
        name: "description",
        content:
          "A plain-English guide to shields, Eco-Coins, grid multipliers, streaks, badges and your Eco-City.",
      },
      { property: "og:title", content: "How GridGuardian Works — Beginner's Guide" },
      {
        property: "og:description",
        content: "Put your phone down when the grid is dirty. Earn coins. Build a greener city.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuidePage,
});

const STEPS = [
  {
    icon: Zap,
    title: "1. Check the grid",
    body: "The power grid gets dirtier at some hours than others. When lots of coal and gas are burning, every watt you use pollutes more. The Overview page shows that live, in one number.",
    plain: "Green number = clean electricity right now. Red number = dirty electricity right now.",
  },
  {
    icon: Shield,
    title: "2. Deploy a shield",
    body: "A shield is a timer for 5, 10, 15 or 30 minutes where you put the device down. Leave the tab and the shield pauses — you can resume it, but the clock is honest.",
    plain: "Pick a length, press start, go do something offline.",
  },
  {
    icon: Coins,
    title: "3. Earn Eco-Coins",
    body: "Coins = base reward for the length × grid multiplier for how dirty the grid was + streak bonus. Detoxing during a dirty hour is worth up to 3× more, because you prevented more pollution.",
    plain: "Same 10 minutes can be worth 90 coins or 270 coins. Timing is the whole game.",
  },
  {
    icon: Flame,
    title: "4. Keep the streak",
    body: "One completed shield a day keeps your streak alive. 3 days adds +10%, 7 days +20%, 14 days +35% on every reward.",
    plain: "Show up daily, get paid more.",
  },
  {
    icon: Building2,
    title: "5. Spend it on your city",
    body: "Coins buy solar arrays, wind farms, forests and transit in your Eco-City. Each build raises clean energy and drops pollution in your skyline.",
    plain: "Your habit becomes a visible, growing green city.",
  },
  {
    icon: Trophy,
    title: "6. Climb and collect",
    body: "Minutes offline rank you on the world leaderboard. Milestones unlock badges, and challenges pay out bonus coins.",
    plain: "Proof you're not just scrolling less — you're ahead of people who aren't.",
  },
];

const GLOSSARY = [
  {
    term: "Grid carbon intensity (gCO₂e/kWh)",
    def: "How much CO₂ is released for each unit of electricity right now. Under 200 is clean, 200–400 is average, above 400 is dirty.",
  },
  {
    term: "Grid multiplier",
    def: "Your reward boost based on that number: 1× when clean, 1.5× when average, 3× when dirty.",
  },
  {
    term: "Eco-Coins",
    def: "The in-app currency you earn from finished shields. Spend them in the Eco-City.",
  },
  {
    term: "Impact Points",
    def: "A score that only ever goes up. It tracks lifetime effort, even after you spend coins.",
  },
  {
    term: "Avoided CO₂",
    def: "An estimate of the pollution that never happened, based on a 12 W device and the grid intensity while you were offline.",
  },
  {
    term: "Detox minutes",
    def: "Total protected screen-free time. This is what the leaderboard ranks you on.",
  },
];

function GuidePage() {
  return (
    <div className="space-y-8 animate-rise">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">How to play</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          GridGuardian turns one small habit — putting your phone down — into measurable
          real-world emissions you stopped. Here is the whole game in six steps.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body, plain }) => (
          <article key={title} className="glass glass-hover p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Icon className="h-4.5 w-4.5 text-primary" />
            </span>
            <h2 className="mt-4 text-sm font-semibold">{title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">{body}</p>
            <p className="mt-3 rounded-xl border border-border/70 px-3 py-2 text-xs text-foreground">
              In short: {plain}
            </p>
          </article>
        ))}
      </section>

      <section className="glass p-5 sm:p-6">
        <h2 className="text-base font-semibold">Every term, explained once</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt className="text-sm font-medium">{g.term}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">{g.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="glass p-5 sm:p-6">
        <h2 className="text-base font-semibold">The fastest way to win</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>1. Wait for the grid number to go red (usually early evening).</li>
          <li>2. Run a 30-minute shield — that is the biggest base reward at 3×.</li>
          <li>3. Do one short shield every single day to hold the streak bonus.</li>
          <li>4. Spend coins on wind and solar first; they give the most clean energy per coin.</li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/shield"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          Start your first shield
        </Link>
        <Link
          to="/leaderboard"
          className="rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          See the leaderboard
        </Link>
      </div>
    </div>
  );
}
