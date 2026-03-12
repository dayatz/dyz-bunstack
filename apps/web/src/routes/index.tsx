import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Skeleton } from "@dyz-bunstack-app/ui";
import { authClient } from "#/libs/auth";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to dyz-bunstack
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          A full-stack monorepo template with React, ElysiaJS, and PostgreSQL.
          Built for shipping fast.
        </p>
        <div className="flex justify-center gap-3">
          {isPending ? (
            <>
              <Skeleton className="h-11 w-28 rounded-md" />
              <Skeleton className="h-11 w-28 rounded-md" />
            </>
          ) : session ? (
            <Link to="/profile">
              <Button size="lg">Go to Profile</Button>
            </Link>
          ) : (
            <>
              <Link to="/sign-in">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button variant="outline" size="lg">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Type-Safe",
            description:
              "End-to-end type safety from database schema to frontend components.",
          },
          {
            title: "Fast",
            description:
              "Bun runtime, Vite bundler, and ElysiaJS for maximum performance.",
          },
          {
            title: "Batteries Included",
            description:
              "Auth, roles, file uploads, validation, and error handling out of the box.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border bg-card p-6 text-card-foreground"
          >
            <h3 className="mb-2 font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
