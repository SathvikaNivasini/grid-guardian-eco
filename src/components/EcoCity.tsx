import { useState } from "react";

import type { CityBuilding } from "../services/types";
import { specById } from "../services/cityService";

interface Placed extends CityBuilding {
  x: number;
  y: number;
}

/** Deterministic isometric plot positions so the city grows predictably. */
const PLOTS: { x: number; y: number }[] = [
  { x: 300, y: 210 },
  { x: 420, y: 250 },
  { x: 180, y: 250 },
  { x: 300, y: 292 },
  { x: 540, y: 210 },
  { x: 60, y: 210 },
  { x: 420, y: 332 },
  { x: 180, y: 332 },
  { x: 540, y: 292 },
  { x: 60, y: 292 },
  { x: 300, y: 374 },
  { x: 420, y: 170 },
  { x: 180, y: 170 },
];

function plotFor(index: number) {
  const base = PLOTS[index % PLOTS.length]!;
  const wrap = Math.floor(index / PLOTS.length);
  return { x: base.x + wrap * 24, y: base.y + wrap * 18 };
}

function Tile({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <polygon
      points={`${x},${y} ${x + 60},${y + 30} ${x},${y + 60} ${x - 60},${y + 30}`}
      fill={tone}
      stroke="var(--color-border)"
    />
  );
}

function BuildingArt({ kind, x, y }: { kind: string; x: number; y: number }) {
  const g = (children: React.ReactNode) => (
    <g transform={`translate(${x},${y})`}>{children}</g>
  );
  switch (kind) {
    case "solar":
      return g(
        <>
          <polygon points="-34,4 0,-14 34,4 0,22" fill="var(--color-secondary)" opacity="0.85" />
          <polygon points="-34,4 0,-14 34,4 0,22" fill="none" stroke="var(--color-border)" />
          <line x1="-14" y1="-2" x2="20" y2="14" stroke="var(--color-background)" opacity="0.5" />
          <rect x="-2" y="20" width="4" height="12" fill="var(--color-muted)" />
        </>,
      );
    case "wind":
      return g(
        <>
          <rect x="-2.5" y="-46" width="5" height="52" fill="var(--color-muted-foreground)" />
          <g transform="translate(0,-46)">
            <g style={{ transformOrigin: "0px 0px", animation: "ring-spin 4s linear infinite" }}>
              <rect x="-1.6" y="-26" width="3.2" height="26" fill="var(--color-primary)" />
              <rect x="-1.6" y="-26" width="3.2" height="26" fill="var(--color-primary)" transform="rotate(120)" />
              <rect x="-1.6" y="-26" width="3.2" height="26" fill="var(--color-primary)" transform="rotate(240)" />
            </g>
          </g>
        </>,
      );
    case "forest":
      return g(
        <>
          {[-18, 0, 18].map((dx, i) => (
            <g key={dx} transform={`translate(${dx},${i === 1 ? -8 : 0})`}>
              <rect x="-2" y="0" width="4" height="12" fill="var(--color-muted)" />
              <circle cx="0" cy="-6" r="11" fill="var(--color-primary)" opacity="0.75" />
            </g>
          ))}
        </>,
      );
    case "tower":
      return g(
        <>
          <polygon points="-16,4 0,-4 16,4 16,-44 0,-56 -16,-44" fill="var(--color-surface-2)" />
          <polygon points="-16,-44 0,-56 16,-44 0,-34" fill="var(--color-primary)" opacity="0.65" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="-12" y={-38 + i * 11} width="24" height="4" fill="var(--color-primary)" opacity="0.4" />
          ))}
        </>,
      );
    case "transit":
      return g(
        <>
          <rect x="-32" y="-18" width="64" height="24" rx="8" fill="var(--color-surface-2)" />
          <rect x="-26" y="-13" width="52" height="9" rx="4" fill="var(--color-secondary)" opacity="0.7" />
          <circle cx="-16" cy="9" r="5" fill="var(--color-muted)" />
          <circle cx="16" cy="9" r="5" fill="var(--color-muted)" />
        </>,
      );
    case "water":
      return g(
        <>
          <ellipse cx="0" cy="4" rx="30" ry="15" fill="var(--color-secondary)" opacity="0.35" />
          <ellipse cx="0" cy="0" rx="20" ry="10" fill="var(--color-secondary)" opacity="0.55" />
          <circle cx="0" cy="-2" r="5" fill="var(--color-secondary)" />
        </>,
      );
    case "storage":
      return g(
        <>
          <rect x="-24" y="-24" width="48" height="30" rx="6" fill="var(--color-surface-2)" />
          <rect x="-16" y="-16" width="32" height="14" rx="3" fill="var(--color-warning)" opacity="0.7" />
          <rect x="-6" y="6" width="12" height="6" fill="var(--color-muted)" />
        </>,
      );
    default:
      return g(<rect x="-16" y="-20" width="32" height="26" fill="var(--color-surface-2)" />);
  }
}

export function EcoCity({
  buildings,
  onSelect,
  selectedId,
}: {
  buildings: CityBuilding[];
  onSelect: (b: CityBuilding | null) => void;
  selectedId?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const placed: Placed[] = buildings.map((b, i) => ({ ...b, ...plotFor(b.slot ?? i) }));
  const newestId = buildings[buildings.length - 1]?.instanceId;

  return (
    <div className="glass relative overflow-hidden">
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        {[
          { label: "−", next: Math.max(0.7, zoom - 0.15) },
          { label: "+", next: Math.min(1.6, zoom + 0.15) },
        ].map((b) => (
          <button
            key={b.label}
            onClick={() => setZoom(b.next)}
            aria-label={b.label === "+" ? "Zoom in" : "Zoom out"}
            className="num h-8 w-8 rounded-lg border border-border bg-surface/80 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {b.label}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 600 460"
        className="h-[360px] w-full sm:h-[480px]"
        role="img"
        aria-label="Your Eco-City"
        onClick={() => onSelect(null)}
      >
        <defs>
          <radialGradient id="gg-sky" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="460" fill="url(#gg-sky)" />
        {Array.from({ length: 26 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 97) % 600}
            cy={(i * 53) % 150}
            r={i % 4 === 0 ? 1.6 : 1}
            fill="var(--color-primary)"
            opacity={0.25}
            style={{ animation: `shimmer ${2 + (i % 5)}s ease-in-out infinite` }}
          />
        ))}

        <g transform={`translate(300,90) scale(${zoom}) translate(-300,-90)`}>
          {/* ground plates */}
          {PLOTS.map((p, i) => (
            <Tile key={i} x={p.x} y={p.y} tone={i % 2 ? "var(--color-surface)" : "var(--color-surface-2)"} />
          ))}
          {/* roads */}
          <path
            d="M60 240 L300 360 L540 240"
            stroke="var(--color-muted)"
            strokeWidth="7"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M60 240 L300 360 L540 240"
            stroke="var(--color-primary)"
            strokeWidth="1"
            strokeDasharray="8 12"
            fill="none"
            opacity="0.5"
          />

          {placed
            .slice()
            .sort((a, b) => a.y - b.y)
            .map((b) => {
              const spec = specById(b.specId);
              if (!spec) return null;
              const isNew = b.instanceId === newestId;
              const isSelected = b.instanceId === selectedId;
              return (
                <g
                  key={b.instanceId}
                  className="cursor-pointer"
                  style={isNew ? { animation: "pop 0.6s cubic-bezier(0.16,1,0.3,1) both" } : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(b);
                  }}
                >
                  {isSelected && (
                    <ellipse
                      cx={b.x}
                      cy={b.y + 30}
                      rx="46"
                      ry="23"
                      fill="var(--color-primary)"
                      opacity="0.18"
                    />
                  )}
                  <BuildingArt kind={spec.kind} x={b.x} y={b.y + 22} />
                </g>
              );
            })}

          {placed.length === 0 && (
            <text
              x="300"
              y="300"
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
              fontSize="13"
            >
              Empty plots await. Build your first installation.
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
