import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Hammer, Zap } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { EcoCity } from "../components/EcoCity";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { BUILDING_CATALOG, cityStats, specById } from "../services/cityService";
import type { CityBuilding } from "../services/types";

export const Route = createFileRoute("/city")({
  head: () => ({
    meta: [
      { title: "Eco-City — GridGuardian" },
      {
        name: "description",
        content:
          "Spend Eco-Coins earned from detox sessions to build solar arrays, wind farms and green towers in your living Eco-City.",
      },
      { property: "og:title", content: "Eco-City — GridGuardian" },
      {
        property: "og:description",
        content: "Turn detox minutes into clean-energy infrastructure for your own city.",
      },
    ],
  }),
  component: CityPage,
});

function CityPage() {
  const { user, buildBuilding } = useGuardian();
  const [selected, setSelected] = useState<CityBuilding | null>(null);
  const stats = cityStats(user.buildings);
  const selectedSpec = selected ? specById(selected.specId) : null;

  return (
    <div className="space-y-6 animate-rise">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Eco-City</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every protected minute becomes infrastructure. City level {stats.level} ·{" "}
            {stats.population.toLocaleString()} residents
          </p>
        </div>
        <div className="flex gap-3">
          <Pill icon={<Coins className="h-3.5 w-3.5" />} label="Eco-Coins" value={user.coins} tone="primary" />
          <Pill icon={<Zap className="h-3.5 w-3.5" />} label="Clean energy" value={stats.cleanEnergy} tone="secondary" />
          <Pill label="Pollution" value={stats.pollution} tone="warning" />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <EcoCity
            buildings={user.buildings}
            onSelect={setSelected}
            selectedId={selected?.instanceId}
          />

          {selected && selectedSpec ? (
            <div className="glass p-5 animate-pop">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {selectedSpec.name}
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <Detail label="Status" value="ONLINE" tone="primary" />
                <Detail label="Energy" value={`+${selectedSpec.cleanEnergy} Clean Energy`} />
                <Detail label="Impact" value={`${selectedSpec.pollution} Pollution`} />
                <Detail
                  label="Built"
                  value={new Date(selected.builtAt).toDateString() === new Date().toDateString()
                    ? "Today"
                    : new Date(selected.builtAt).toLocaleDateString()}
                />
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">{selectedSpec.blurb}</p>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Tap any structure to inspect it. Use + / − to zoom the skyline.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Build queue
          </h2>
          {BUILDING_CATALOG.map((spec) => {
            const affordable = user.coins >= spec.cost;
            const owned = user.buildings.filter((b) => b.specId === spec.id).length;
            return (
              <article key={spec.id} className="glass glass-hover p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{spec.name}</h3>
                    <p className="num mt-0.5 text-xs text-primary">Cost: {spec.cost} Eco-Coins</p>
                  </div>
                  {owned > 0 && (
                    <span className="num rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      ×{owned}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{spec.blurb}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="num text-[10px] uppercase tracking-[0.14em] text-secondary">
                    +{spec.cleanEnergy} energy · {spec.pollution} pollution
                  </span>
                  <button
                    onClick={() => buildBuilding(spec.id)}
                    disabled={!affordable}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                  >
                    <Hammer className="h-3.5 w-3.5" />
                    BUILD
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "secondary" | "warning";
}) {
  const toneClass =
    tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-warning";
  return (
    <div className="glass px-3 py-2">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={`num mt-0.5 text-lg font-semibold ${toneClass}`}>
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}

function Detail({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className={`num mt-1 text-sm ${tone === "primary" ? "text-primary" : "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}
