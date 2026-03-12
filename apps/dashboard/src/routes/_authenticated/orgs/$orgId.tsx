import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSquare01Icon, UserGroupIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@dyz-bunstack-app/ui";
import { orgQueries } from "#/modules/organizations/queries";

export const Route = createFileRoute("/_authenticated/orgs/$orgId")({
  component: OrgLayout,
});

const orgNavItems = [
  { title: "Overview", to: ".", icon: DashboardSquare01Icon },
  { title: "Members", to: "./members", icon: UserGroupIcon },
  { title: "Settings", to: "./settings", icon: Settings01Icon },
] as const;

function OrgLayout() {
  const { orgId } = Route.useParams();
  const { data: org, isLoading } = useQuery(orgQueries.detail(orgId));
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/organizations"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Organizations
        </Link>
        <span className="text-muted-foreground">/</span>
        {isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <h1 className="text-lg font-semibold">{org?.name ?? "Organization"}</h1>
        )}
      </div>

      <nav className="flex gap-1 border-b">
        {orgNavItems.map((item) => {
          const href =
            item.to === "."
              ? `/orgs/${orgId}`
              : `/orgs/${orgId}/${item.to.replace("./", "")}`;
          const isActive =
            item.to === "."
              ? currentPath === `/orgs/${orgId}` || currentPath === `/orgs/${orgId}/`
              : currentPath.startsWith(href);

          return (
            <Link
              key={item.title}
              to={href}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={item.icon} size={16} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
