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
import { orgQueries } from "#/modules/organizations/queries";

export const Route = createFileRoute(
  "/_authenticated/orgs/$orgId/settings"
)({
  component: OrgSettings,
});

function OrgSettings() {
  const { orgId } = Route.useParams();
  const { data: org, isLoading } = useQuery(orgQueries.detail(orgId));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information about this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs">{org?.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{org?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Slug</dt>
              <dd>
                <Badge variant="secondary">{org?.slug ?? "—"}</Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Members</dt>
              <dd>{org?.members?.length ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd>
                {org?.createdAt
                  ? new Date(org.createdAt).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
