import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useGuardian } from "../state/guardian";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { bestSession, dayKey, totalAvoidedCo2Kg } from "../services/userService";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Your Impact — GridGuardian" },
      {
        name: "description",
        content:
          "Track detox minutes, Eco-Coins earned and estimated avoided CO₂ from every grid-aware detox session.",
      },
      { property: "og:title", content: "Your Impact — GridGuardian" },
      {
        property: "og:description",
        content: "A transparent view of the emissions your digital detox habit avoided.",
      },
    ],
  }),
  component: ImpactPage,
});

function ImpactPage() {
  const { user } = useGuardian();
  const best = bestSession(user);
  const avoided = totalAvoidedCo2Kg(user);

  const byDay = new Map<
    string,
    { day: string; minutes: number; intensitySum: number; count: number; co2: number }
  >();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay.set(dayKey(d.getTime()), {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      minutes: 0,
      intensitySum: 0,
      count: 0,
      co2: 0,
    });
  }
  for (const s of user.sessions) {
    const row = byDay.get(dayKey(s.endedAt));
    if (!row) continue;
    row.minutes += s.durationMin;
    row.intensitySum += s.avgIntensity;
    row.count += 1;
    row.co2 += s.avoidedCo2Kg;
  }
  const rows = [...byDay.values()].map((r) => ({
    day: r.day,
    minutes: r.minutes,
    intensity: r.count ? Math.round(r.intensitySum / r.count) : 0,
    co2: Number(r.co2.toFixed(3)),
  }));

  return (
    <div className="space-y-6 animate-rise">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">Your impact</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every number below is derived from your own sessions and the grid intensity observed
          during them.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={user.detoxMinutes} label="Detox Minutes" tone="primary" />
        <Stat value={user.coins} label="Eco-Coins Earned" tone="warning" />
        <Stat value={user.sessions.length} label="Detox Sessions" tone="secondary" />
        <Stat value={avoided} decimals={2} suffix=" kg" label="Estimated Avoided CO₂*" />
      </div>

      <p className="text-[11px] text-muted-foreground">
        *Estimated using device-energy assumptions (12 W avoided load) and the grid intensity
        observed during your sessions.
      </p>

      <section className="glass p-5 sm:p-6">
        <h2 className="text-base font-semibold">Last 7 days</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Detox minutes (bars) against the average grid intensity during those detoxes (line).
        </p>
        <div className="mt-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="minutes" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="var(--color-warning)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your best detox
          </h2>
          {best ? (
            <div className="mt-4 space-y-3">
              <p className="num text-lg font-semibold">
                {new Date(best.startedAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}{" "}
                ·{" "}
                {new Date(best.startedAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <dl className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Grid intensity
                  </dt>
                  <dd className="num mt-1 text-destructive">{best.avgIntensity} gCO₂e/kWh</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Reward
                  </dt>
                  <dd className="num mt-1 text-primary">{best.multiplier.toFixed(1)}×</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Duration
                  </dt>
                  <dd className="num mt-1">{best.durationMin} min</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No sessions yet — your first shield will land here.
            </p>
          )}
        </section>

        <section className="glass p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Emissions avoided by day
          </h2>
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={46}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v} kg CO₂e`, "Avoided"]}
                />
                <Bar dataKey="co2" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  decimals = 0,
  suffix,
  tone,
}: {
  value: number;
  label: string;
  decimals?: number;
  suffix?: string;
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
    <div className="glass glass-hover p-5">
      <p className={`num text-3xl font-semibold ${toneClass}`}>
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
