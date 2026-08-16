import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatClock } from "../services/gridService";
import type { GridSnapshot } from "../services/types";

interface Row {
  t: number;
  history: number | null;
  forecast: number | null;
}

function buildRows(grid: GridSnapshot): Row[] {
  return grid.series.map((p, i) => {
    const prev = grid.series[i - 1];
    const isForecast = p.kind === "forecast";
    const bridging = isForecast && prev?.kind === "now";
    return {
      t: p.t,
      history: isForecast ? null : p.intensity,
      forecast: isForecast || prev?.kind === "now" || bridging ? p.intensity : null,
    };
  });
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload.find((p: any) => p.value != null)?.value as number | undefined;
  if (value == null) return null;
  return (
    <div className="glass px-3 py-2 text-xs">
      <p className="num font-semibold text-foreground">{formatClock(label as number)}</p>
      <p className="num mt-0.5 text-primary">{Math.round(value)} gCO₂e/kWh</p>
    </div>
  );
}

export function GridChart({ grid }: { grid: GridSnapshot }) {
  const rows = buildRows(grid);
  const first = rows[0]?.t ?? Date.now();
  const last = rows[rows.length - 1]?.t ?? Date.now();

  return (
    <section className="glass p-5 sm:p-6 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Carbon intensity timeline</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Last 8 hours, plus 3-hour projection · gCO₂e/kWh
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-primary" /> Observed
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-secondary" /> Projected
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-warning" /> You are here
          </span>
        </div>
      </div>

      <div className="mt-5 h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gg-history" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gg-forecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <ReferenceArea
              y1={0}
              y2={200}
              fill="var(--color-primary)"
              fillOpacity={0.05}
              ifOverflow="extendDomain"
            />
            <ReferenceArea y1={200} y2={400} fill="var(--color-warning)" fillOpacity={0.05} />
            <ReferenceArea y1={400} y2={700} fill="var(--color-destructive)" fillOpacity={0.06} />

            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[first, last]}
              scale="time"
              tickFormatter={(v) => formatClock(v as number)}
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={[0, 650]}
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={46}
            />
            <Tooltip content={<ChartTooltip />} />

            <Area
              type="monotone"
              dataKey="history"
              stroke="var(--color-primary)"
              strokeWidth={2.4}
              fill="url(#gg-history)"
              connectNulls
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-primary)" }}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="var(--color-secondary)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#gg-forecast)"
              connectNulls
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-secondary)" }}
            />

            <ReferenceLine
              x={grid.updatedAt}
              stroke="var(--color-warning)"
              strokeWidth={1.5}
              label={{
                value: "YOU ARE HERE",
                position: "insideTopRight",
                fill: "var(--color-warning)",
                fontSize: 10,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
