import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";
import { authClient } from "#/libs/auth";
import { useSignOut } from "#/modules/auth/mutations";
import { Button } from "@dyz-bunstack-app/ui";

export default function Header() {
  const { data: session } = authClient.useSession();
  const signOut = useSignOut();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-base font-semibold tracking-tight text-foreground no-underline"
          >
            dyz-bunstack
          </Link>
          <div className="hidden items-center gap-4 text-sm sm:flex">
            <Link
              to="/"
              className="text-muted-foreground no-underline transition-colors hover:text-foreground [&.active]:text-foreground"
            >
              Home
            </Link>
            {session && (
              <Link
                to="/profile"
                className="text-muted-foreground no-underline transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Profile
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut.mutate(undefined)}
                disabled={signOut.isPending}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
