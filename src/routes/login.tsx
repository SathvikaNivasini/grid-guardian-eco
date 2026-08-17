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
  const [username, setUsername] = useState("");
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
    const err = await signIn(username.trim(), password);
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
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid #22c55e",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" style={pageStyle}>
      <div className="w-full max-w-sm space-y-8 animate-rise" style={cardStyle}>
        <div style={{ textAlign: "center" }}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent" style={iconBoxStyle}>
            <Shield width={32} height={32} style={{ color: "#22c55e" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 16, color: "#fff" }}>
            Welcome back, Guardian
          </h1>
          <p style={{ fontSize: 14, color: "#999", marginTop: 4 }}>
            Sign in with your username and password.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} style={{ marginTop: 32 }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                fontSize: 14,
                borderRadius: 12,
                border: "1px solid #ef444466",
                background: "#ef444418",
                color: "#ef4444",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <label htmlFor="username" style={{ fontSize: 14, fontWeight: 500, color: "#e5e5e5" }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label htmlFor="password" style={{ fontSize: 14, fontWeight: 500, color: "#e5e5e5" }}>
              Password
            </label>
            <div style={{ position: "relative", marginTop: 6 }}>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={{ ...inputStyle, paddingRight: 40, marginTop: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                }}
              >
                {showPw ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ ...btnStyle, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid #000",
                  borderTopColor: "transparent",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <LogIn width={16} height={16} />
            )}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "#999", marginTop: 32 }}>
          New to GridGuardian?{" "}
          <Link to="/signup" style={{ color: "#22c55e", fontWeight: 500, textDecoration: "none" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
