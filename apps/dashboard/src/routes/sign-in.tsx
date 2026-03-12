import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignIn } from "#/modules/auth/mutations";
import { Button } from "@dyz-bunstack-app/ui";

export const Route = createFileRoute("/sign-in")({ component: SignInPage });

function SignInPage() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    signIn.mutate(
      { email, password },
      {
        onSuccess: () => navigate({ to: "/" }),
        onError: () => setError("Invalid email or password"),
      },
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Sign In
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={signIn.isPending}>
            {signIn.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/sign-up" className="font-medium text-primary underline">
            Sign Up
          </Link>
        </p>

        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium">Demo accounts:</p>
          <p>
            <button type="button" className="underline hover:text-foreground" onClick={() => { setEmail("admin@demo.com"); setPassword("password123"); }}>
              admin@demo.com
            </button>
            {" "}/ password123 (admin)
          </p>
          <p>
            <button type="button" className="underline hover:text-foreground" onClick={() => { setEmail("user@demo.com"); setPassword("password123"); }}>
              user@demo.com
            </button>
            {" "}/ password123 (user)
          </p>
        </div>
      </div>
    </main>
  );
}
