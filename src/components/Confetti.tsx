import { useMemo } from "react";

const COLORS = ["bg-primary", "bg-secondary", "bg-warning", "bg-destructive"];

/** Lightweight CSS confetti burst — no dependencies. */
export function Confetti({ count = 42 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.4,
        size: 4 + Math.random() * 5,
        color: COLORS[i % COLORS.length]!,
        rotate: Math.random() * 360,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`absolute top-0 rounded-[2px] ${p.color}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.8,
            opacity: 0.85,
            transform: `rotate(${p.rotate}deg)`,
            animation: `gg-fall ${p.duration}s ${p.delay}s cubic-bezier(0.3,0.7,0.4,1) forwards`,
          }}
        />
      ))}
      <style>{`@keyframes gg-fall{0%{transform:translateY(-10%) rotate(0deg);opacity:0}15%{opacity:.9}100%{transform:translateY(105vh) rotate(540deg);opacity:0}}`}</style>
    </div>
  );
}
