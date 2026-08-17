import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useMatchRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth } from "../state/auth";
import { GuardianProvider } from "../state/guardian";
import { Sidebar, MobileNav, MobileTopBar } from "../components/Nav";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GridGuardian" },
      {
        name: "description",
        content:
          "Turn live electricity-grid carbon intensity into a digital detox game. Shield the grid, earn Eco-Coins, build a clean-energy city.",
      },
      { property: "og:title", content: "GridGuardian" },
      {
        property: "og:description",
        content: "Detox when the grid is dirtiest and grow your own clean-energy city.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const matchRoute = useMatchRoute();
  const isAuthPage = matchRoute({ to: "/login" }) || matchRoute({ to: "/signup" });

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#fff" }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #22c55e", borderTopColor: "transparent", animation: "spin 1s linear infinite" }}
        />
      </div>
    );
  }

  if (!user && !isAuthPage) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background px-4"
        style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "system-ui, -apple-system, sans-serif", padding: "0 1rem" }}
      >
        <div className="w-full max-w-sm space-y-6 text-center animate-rise" style={{ maxWidth: 384, textAlign: "center" }}>
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent"
            style={{ margin: "0 auto", display: "flex", width: 80, height: 80, alignItems: "center", justifyContent: "center", borderRadius: 16, background: "#1a2e1a" }}
          >
            <svg width="40" height="40" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontSize: 24, fontWeight: 600, marginTop: 24, color: "#fff" }}>GridGuardian</h1>
          <p className="text-sm text-muted-foreground" style={{ fontSize: 14, color: "#999", marginTop: 8 }}>
            Turn live electricity-grid data into a digital detox game.
            Sign in to start protecting the grid.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24, alignItems: "center" }}>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 24px", fontSize: 14, fontWeight: 600, borderRadius: 12, background: "#22c55e", color: "#000", textDecoration: "none" }}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 24px", fontSize: 14, fontWeight: 500, borderRadius: 12, border: "1px solid #333", color: "#e5e5e5", textDecoration: "none" }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <GuardianProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <MobileTopBar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 lg:pl-8 lg:pr-8 lg:pb-12 lg:ml-64 lg:max-w-[calc(72rem-16rem)]">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </GuardianProvider>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

