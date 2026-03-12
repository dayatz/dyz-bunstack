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
import { orgQueries } from "#/modules/organizations/queries";

export const Route = createFileRoute("/_authenticated/orgs/$orgId/")({
  component: OrgOverview,
});

function OrgOverview() {
  const { orgId } = Route.useParams();
  const { data: org, isLoading } = useQuery(orgQueries.detail(orgId));

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Members</CardDescription>
          <CardTitle className="text-3xl">
            {org?.members?.length ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Pending Invitations</CardDescription>
          <CardTitle className="text-3xl">
            {org?.invitations?.filter((i: any) => i.status === "pending").length ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Slug</dt>
              <dd>
                <Badge variant="secondary">{org?.slug ?? "—"}</Badge>
              </dd>
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
