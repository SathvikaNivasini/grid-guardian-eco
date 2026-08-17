import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { getGridSnapshot, fetchLiveGridData } from "../services/gridService";
import type { GridSnapshot, UserSettings, UserState } from "../services/types";
import { canAfford, specById } from "../services/cityService";
import { computeStreak, defaultSettings, initialUser, dayKey } from "../services/userService";
import { calculateReward, type RewardBreakdown } from "../services/rewardEngine";
import {
  averageIntensity,
  createSession,
  finalizeSession,
  progressOf,
  remainingMs,
  type ActiveSession,
} from "../services/detoxService";
import { useAuth } from "./auth";

const STORAGE_KEY = "gridguardian.state.v1";
const GRID_REFRESH_MS = 30_000;
const LIVE_FETCH_MS = 120_000;

interface GuardianContextValue {
  hydrated: boolean;
  user: UserState;
  grid: GridSnapshot | null;
  session: ActiveSession | null;
  lastResult: { reward: RewardBreakdown; durationMin: number } | null;
  startSession: (durationMin: number) => void;
  resumeSession: () => void;
  endSession: () => void;
  clearResult: () => void;
  buildBuilding: (specId: string) => void;
  claimChallenge: (id: string, coins: number) => void;
  claimDailyMission: (id: string, coins: number) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetProgress: () => void;
  remaining: number;
  progress: number;
  projected: RewardBreakdown | null;
}

const GuardianContext = createContext<GuardianContextValue | null>(null);

function migrateUser(raw: unknown): UserState {
  const parsed = raw as UserState;
  const merged = { ...initialUser(), ...parsed };
  if (!merged.settings) merged.settings = defaultSettings();
  else merged.settings = { ...defaultSettings(), ...merged.settings };
  if (!merged.dailyMissionDate) merged.dailyMissionDate = "";
  if (!merged.claimedDailyMissions) merged.claimedDailyMissions = [];
  return merged;
}

function loadUserLocal(): UserState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrateUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function GuardianProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<UserState>(() => initialUser());
  const [grid, setGrid] = useState<GridSnapshot | null>(null);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [lastResult, setLastResult] =
    useState<{ reward: RewardBreakdown; durationMin: number } | null>(null);
  const [tick, setTick] = useState(0);
  const gridRef = useRef<GridSnapshot | null>(null);
  const liveGridRef = useRef<GridSnapshot | null>(null);
  const prevAuthId = useRef<string | null>(null);

  useEffect(() => {
    const authId = authUser?.id ?? null;
    const authName =
      authUser?.name ??
      authUser?.username ??
      "Guardian";

    let loaded = loadUserLocal();

    if (loaded) {
      loaded.name = loaded.name || authName;
      loaded.streakDays = computeStreak(loaded.sessions);
      setUser(loaded);
    } else {
      setUser({ ...initialUser(), name: authName });
    }

    const today = dayKey(Date.now());
    setUser((prev) => {
      if (prev.dailyMissionDate !== today) {
        return { ...prev, dailyMissionDate: today, claimedDailyMissions: [] };
      }
      return prev;
    });

    const snap = getGridSnapshot();
    gridRef.current = snap;
    setGrid(snap);
    setHydrated(true);
    prevAuthId.current = authId;
  }, [authUser?.id, authUser?.name, authUser?.username]);

  useEffect(() => {
    if (!hydrated) return;

    const source = user.settings?.gridSource ?? "auto";
    if (source === "simulation") return;

    let cancelled = false;
    const doFetch = async () => {
      const region = user.settings?.region ?? "GB";
      const live = await fetchLiveGridData(region);
      if (cancelled) return;
      if (live) {
        liveGridRef.current = live;
        gridRef.current = live;
        setGrid(live);
      }
    };

    void doFetch();
    const id = setInterval(() => void doFetch(), LIVE_FETCH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hydrated, user.settings?.gridSource, user.settings?.region]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const source = user.settings?.gridSource ?? "auto";
    if (source !== "simulation" && liveGridRef.current) return;

    const id = setInterval(() => {
      const snap = getGridSnapshot();
      gridRef.current = snap;
      setGrid(snap);
    }, GRID_REFRESH_MS);
    return () => clearInterval(id);
  }, [hydrated, user.settings?.gridSource]);

  useEffect(() => {
    if (!session || session.status !== "running") return;
    const id = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.status !== "running") return prev;
        const now = Date.now();
        const elapsedMs = prev.elapsedMs + (now - prev.lastTickAt);
        const samples =
          gridRef.current && Math.floor(elapsedMs / 15_000) > prev.intensitySamples.length - 1
            ? [...prev.intensitySamples, gridRef.current.intensity]
            : prev.intensitySamples;
        const next: ActiveSession = {
          ...prev,
          elapsedMs,
          lastTickAt: now,
          intensitySamples: samples,
        };
        if (elapsedMs >= prev.durationMin * 60_000) {
          return { ...next, elapsedMs: prev.durationMin * 60_000, status: "complete" };
        }
        return next;
      });
      setTick((t) => t + 1);
    }, 250);
    return () => clearInterval(id);
  }, [session?.status, session?.id]);

  useEffect(() => {
    if (!session || session.status !== "running") return;
    const onHidden = () => {
      if (document.visibilityState !== "hidden") return;
      setSession((prev) =>
        prev && prev.status === "running" ? { ...prev, status: "interrupted" } : prev,
      );
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("blur", onHidden);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("blur", onHidden);
    };
  }, [session?.status, session?.id]);

  const completedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!session || session.status !== "complete") return;
    if (completedRef.current === session.id) return;
    completedRef.current = session.id;

    const dw = user.settings?.devicePowerWatts ?? 5;
    const reward = calculateReward({
      durationMin: session.durationMin,
      intensity: averageIntensity(session) || (gridRef.current?.intensity ?? 300),
      streakDays: user.streakDays,
      deviceWatts: dw,
    });
    const record = finalizeSession(session, reward);
    setUser((prev) => {
      const sessions = [...prev.sessions, record];
      return {
        ...prev,
        sessions,
        coins: prev.coins + reward.coins,
        impactPoints: prev.impactPoints + reward.impactPoints,
        detoxMinutes: prev.detoxMinutes + session.durationMin,
        streakDays: computeStreak(sessions),
      };
    });
    setLastResult({ reward, durationMin: session.durationMin });
  }, [session?.status, session?.id]);

  const startSession = useCallback(
    (durationMin: number) => {
      const intensity = gridRef.current?.intensity ?? 300;
      completedRef.current = null;
      setLastResult(null);
      setSession(createSession(durationMin, intensity));
      toast.success(`Shield deployed for ${durationMin} minutes`, {
        description: "Put the device down. Your city is watching.",
      });
    },
    [],
  );

  const resumeSession = useCallback(() => {
    setSession((prev) =>
      prev ? { ...prev, status: "running", lastTickAt: Date.now() } : prev,
    );
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
    setLastResult(null);
    completedRef.current = null;
  }, []);

  const clearResult = useCallback(() => {
    setSession(null);
    setLastResult(null);
  }, []);

  const buildBuilding = useCallback((specId: string) => {
    const spec = specById(specId);
    if (!spec) return;
    setUser((prev) => {
      if (!canAfford(prev, spec)) {
        toast.error("Not enough Eco-Coins", {
          description: `${spec.name} costs ${spec.cost} coins. Deploy another shield to earn more.`,
        });
        return prev;
      }
      toast.success(`${spec.name} under construction`, { description: spec.blurb });
      return {
        ...prev,
        coins: prev.coins - spec.cost,
        buildings: [
          ...prev.buildings,
          {
            instanceId: `b_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`,
            specId,
            builtAt: Date.now(),
            slot: prev.buildings.length,
          },
        ],
      };
    });
  }, []);

  const claimChallenge = useCallback((id: string, coins: number) => {
    setUser((prev) => {
      if (prev.claimedChallenges.includes(id)) return prev;
      toast.success("Challenge complete", { description: `+${coins} Eco-Coins claimed.` });
      return {
        ...prev,
        coins: prev.coins + coins,
        claimedChallenges: [...prev.claimedChallenges, id],
      };
    });
  }, []);

  const claimDailyMission = useCallback((id: string, coins: number) => {
    setUser((prev) => {
      if (prev.claimedDailyMissions.includes(id)) return prev;
      toast.success("Mission complete!", { description: `+${coins} Eco-Coins earned.` });
      return {
        ...prev,
        coins: prev.coins + coins,
        claimedDailyMissions: [...prev.claimedDailyMissions, id],
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setUser((prev) => ({
      ...prev,
      settings: { ...(prev.settings ?? defaultSettings()), ...patch },
    }));
    toast.success("Settings updated");
  }, []);

  const resetProgress = useCallback(() => {
    setUser(initialUser());
    setSession(null);
    setLastResult(null);
    toast("Progress reset", { description: "Your Guardian file has been cleared." });
  }, []);

  const value = useMemo<GuardianContextValue>(() => {
    const dw = user.settings?.devicePowerWatts ?? 5;
    const projected = session
      ? calculateReward({
          durationMin: session.durationMin,
          intensity: averageIntensity(session) || (grid?.intensity ?? 300),
          streakDays: user.streakDays,
          deviceWatts: dw,
        })
      : null;
    return {
      hydrated,
      user,
      grid,
      session,
      lastResult,
      startSession,
      resumeSession,
      endSession,
      clearResult,
      buildBuilding,
      claimChallenge,
      claimDailyMission,
      updateSettings,
      resetProgress,
      remaining: session ? remainingMs(session) : 0,
      progress: session ? progressOf(session) : 0,
      projected,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, grid, session, lastResult, tick]);

  return <GuardianContext.Provider value={value}>{children}</GuardianContext.Provider>;
}

export function useGuardian() {
  const ctx = useContext(GuardianContext);
  if (!ctx) throw new Error("useGuardian must be used inside GuardianProvider");
  return ctx;
}
