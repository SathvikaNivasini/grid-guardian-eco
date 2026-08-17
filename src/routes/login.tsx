import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, LogIn, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../state/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — GridGuardian" },
      { name: "description", content: "Sign in to your GridGuardian account." },
    ],
  }),
  component: LoginPage,
});

const pageStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  background: "#0a0a0a",
  color: "#e5e5e5",
  fontFamily: "system-ui, -apple-system, sans-serif",
  padding: "0 1rem",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 384,
};

const iconBoxStyle: React.CSSProperties = {
  margin: "0 auto",
  display: "flex",
  width: 64,
  height: 64,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 16,
  background: "#1a2e1a",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  fontSize: 14,
  borderRadius: 12,
  border: "1px solid #333",
  background: "#111",
  color: "#e5e5e5",
  outline: "none",
  boxSizing: "border-box",
  marginTop: 6,
};

const btnStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 12,
  background: "#22c55e",
  color: "#000",
  border: "none",
  cursor: "pointer",
  marginTop: 16,
};

function LoginPage() {
  const { signIn, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    void navigate({ to: "/" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      void navigate({ to: "/" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" style={pageStyle}>
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #22c55e", borderTopColor: "transparent", animation: "spin 1s linear infinite" }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" style={pageStyle}>
      <div className="w-full max-w-sm space-y-8 animate-rise" style={cardStyle}>
        <div style={{ textAlign: "center" }} className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent" style={iconBoxStyle}>
            <Shield width={32} height={32} className="h-8 w-8 text-primary" style={{ color: "#22c55e" }} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold" style={{ fontSize: 24, fontWeight: 600, marginTop: 16, color: "#fff" }}>
            Welcome back, Guardian
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" style={{ fontSize: 14, color: "#999", marginTop: 4 }}>
            Sign in to continue protecting the grid.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" style={{ marginTop: 32 }}>
          {error && (
            <div
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              style={{ padding: "12px 16px", fontSize: 14, borderRadius: 12, border: "1px solid #ef444466", background: "#ef444418", color: "#ef4444" }}
            >
              {error}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <label htmlFor="email" className="block text-sm font-medium text-foreground" style={{ fontSize: 14, fontWeight: 500, color: "#e5e5e5" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="guardian@example.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label htmlFor="password" className="block text-sm font-medium text-foreground" style={{ fontSize: 14, fontWeight: 500, color: "#e5e5e5" }}>
              Password
            </label>
            <div className="relative mt-1.5" style={{ position: "relative", marginTop: 6 }}>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Your password"
                style={{ ...inputStyle, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#999", cursor: "pointer" }}
              >
                {showPw ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            style={{ ...btnStyle, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? (
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #000", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
            ) : (
              <LogIn width={16} height={16} />
            )}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground" style={{ textAlign: "center", fontSize: 14, color: "#999", marginTop: 32 }}>
          New to GridGuardian?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline" style={{ color: "#22c55e", fontWeight: 500, textDecoration: "none" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
