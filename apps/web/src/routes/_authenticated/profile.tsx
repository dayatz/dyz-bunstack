import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "#/libs/auth";
import { useSignOut } from "#/modules/auth/mutations";
import { Button, Skeleton } from "@dyz-bunstack-app/ui";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const signOut = useSignOut();

  if (isPending) return <ProfileSkeleton />;
  if (!session) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your account information
      </p>

      <div className="mt-8 rounded-lg border bg-card p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-muted-foreground">Name</dt>
            <dd className="font-medium">{session.user.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="font-medium">{session.user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Role</dt>
            <dd className="font-medium capitalize">
              {(session.user as any).role || "user"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => signOut.mutate(undefined)}
          disabled={signOut.isPending}
        >
          {signOut.isPending ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-48" />

      <div className="mt-8 rounded-lg border bg-card p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="mt-6 h-9 w-24" />
    </div>
  );
}
