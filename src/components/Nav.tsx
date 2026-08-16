import { Link } from "@tanstack/react-router";
import { Globe2, Shield, Building2, BarChart3, Trophy, Settings, User } from "lucide-react";

import { useGuardian } from "../state/guardian";
import { AnimatedNumber } from "./AnimatedNumber";
import { levelFor } from "../services/userService";

const MAIN = [
  { to: "/", label: "Overview", icon: Globe2 },
  { to: "/shield", label: "Detox Shield", icon: Shield },
  { to: "/city", label: "Eco-City", icon: Building2 },
  { to: "/impact", label: "Impact", icon: BarChart3 },
  { to: "/challenges", label: "Challenges", icon: Trophy },
] as const;

const FOOTER = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function itemClass(active: boolean) {
  return [
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
    active
      ? "bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_var(--color-border)]"
      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
  ].join(" ");
}

export function Sidebar() {
  const { user } = useGuardian();
  const { current } = levelFor(user.detoxMinutes);

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col gap-6 border-r border-border bg-surface/60 px-4 py-6 backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-3 px-2">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
          <Shield className="h-4.5 w-4.5 text-primary" />
          <span className="absolute inset-0 rounded-xl animate-pulse-glow bg-primary/10" />
        </span>
        <span>
          <span className="block font-display text-sm font-semibold tracking-tight">
            GridGuardian
          </span>
          <span className="block text-[11px] text-muted-foreground">
            grid-aware digital detox
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {MAIN.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className={itemClass(false)}
            activeProps={{ className: itemClass(true) }}
          >
            <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="glass px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Eco-Coins
        </p>
        <p className="num mt-1 text-2xl font-semibold text-primary">
          <AnimatedNumber value={user.coins} />
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Level {current.level} · {current.title}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {FOOTER.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={itemClass(false)}
            activeProps={{ className: itemClass(true) }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const items = [...MAIN, FOOTER[1]];
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/85 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="flex items-stretch justify-between">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{label.split(" ").at(-1)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function MobileTopBar() {
  const { user } = useGuardian();
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
      <span className="flex items-center gap-2 font-display text-sm font-semibold">
        <Shield className="h-4 w-4 text-primary" />
        GridGuardian
      </span>
      <span className="num rounded-full border border-border px-3 py-1 text-xs text-primary">
        <AnimatedNumber value={user.coins} /> ◉
      </span>
    </header>
  );
}
