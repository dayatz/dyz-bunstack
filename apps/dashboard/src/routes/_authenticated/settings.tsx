import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@dyz-bunstack-app/ui";
import { statsQueries } from "#/modules/stats/queries";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <AppInfoCard />
        <HealthCheckCard />
      </div>
    </div>
  );
}

function AppInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Info</CardTitle>
        <CardDescription>Template and environment details</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Template</dt>
            <dd className="font-medium">dyz-bunstack</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Environment</dt>
            <dd>
              <Badge variant="outline">
                {import.meta.env.MODE}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function HealthCheckCard() {
  const { data, isLoading, refetch, isFetching } = useQuery(
    statsQueries.health()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Health Check</CardTitle>
            <CardDescription>Service status and latency</CardDescription>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isFetching ? "Checking..." : "Refresh"}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
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
