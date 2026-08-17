import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/** Local user — no email, no Supabase */
export interface LocalUser {
  id: string;
  username: string;
  name: string;
  createdAt: number;
}

interface StoredAccount {
  id: string;
  username: string;
  name: string;
  /** plain text for MVP demo only — never do this in production */
  password: string;
  createdAt: number;
}

interface AuthContextValue {
  user: LocalUser | null;
  session: { user: LocalUser } | null;
  loading: boolean;
  signUp: (username: string, password: string, name: string) => Promise<string | null>;
  signIn: (username: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (username: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCOUNTS_KEY = "gridguardian.accounts.v1";
const SESSION_KEY = "gridguardian.session.v1";

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

function saveSession(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function toLocalUser(account: StoredAccount): LocalUser {
  return {
    id: account.id,
    username: account.username,
    name: account.name,
    createdAt: account.createdAt,
  };
}

function makeId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = loadSession();
    setUser(existing);
    setLoading(false);
  }, []);

  const signUp = useCallback(async (username: string, password: string, name: string) => {
    const normalized = normalizeUsername(username);
    if (!normalized) return "Username is required.";
    if (normalized.length < 3) return "Username must be at least 3 characters.";
    if (!password) return "Password is required.";
    if (password.length < 4) return "Password must be at least 4 characters.";

    const accounts = loadAccounts();
    if (accounts.some((a) => a.username === normalized)) {
      return "That username is already taken.";
    }

    const account: StoredAccount = {
      id: makeId(),
      username: normalized,
      name: name.trim() || normalized,
      password, // MVP only
      createdAt: Date.now(),
    };
    accounts.push(account);
    saveAccounts(accounts);

    const local = toLocalUser(account);
    saveSession(local);
    setUser(local);
    return null;
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const normalized = normalizeUsername(username);
    const accounts = loadAccounts();
    const account = accounts.find((a) => a.username === normalized);

    if (!account) return "No account found with this username.";
    if (account.password !== password) return "Incorrect password.";

    const local = toLocalUser(account);
    saveSession(local);
    setUser(local);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    saveSession(null);
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (_username: string) => {
    return "Password reset is not available in local mode. Create a new account.";
  }, []);

  const session = user ? { user } : null;

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
