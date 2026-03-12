import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from "@dyz-bunstack-app/ui";
import { statsQueries } from "#/modules/stats/queries";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UserCountCard />
        <RecentUsersCard />
        <HealthCard />
      </div>
    </div>
  );
}

function UserCountCard() {
  const { data, isLoading } = useQuery(statsQueries.userCount());

  return (
    <Card>
      <CardHeader>
        <CardDescription>Total Users</CardDescription>
        <CardTitle className="text-3xl">
          {isLoading ? <Skeleton className="h-9 w-16" /> : (data?.total ?? 0)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function RecentUsersCard() {
  const { data: users, isLoading } = useQuery(statsQueries.recentUsers());

  return (
    <Card>
      <CardHeader>
        <CardDescription>Recently Joined</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {users?.map((user) => (
              <li key={user.id} className="flex items-center justify-between">
                <span className="truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
            {(!users || users.length === 0) && (
              <li className="text-muted-foreground">No users yet</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function HealthCard() {
  const { data, isLoading } = useQuery(statsQueries.health());

  return (
    <Card>
      <CardHeader>
        <CardDescription>System Health</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Database</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {data.checks.database.latency}
                </span>
                <Badge
                  variant={
                    data.checks.database.status === "up"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {data.checks.database.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage (S3)</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {data.checks.storage.latency}
                </span>
                <Badge
                  variant={
                    data.checks.storage.status === "up"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {data.checks.storage.status}
                </Badge>
              </div>
            </div>
            <div className="pt-1 text-xs text-muted-foreground">
              Uptime: {Math.floor(data.uptime / 60)}m {data.uptime % 60}s
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
