import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "#/libs/auth";
import { SidebarInset, SidebarProvider, Card, CardHeader, CardTitle, CardDescription } from "@dyz-bunstack-app/ui";
import { AppSidebar } from "#/components/app-sidebar";
import { TopNav } from "#/components/top-nav";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
    return { session };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session } = Route.useRouteContext();

  if ((session.user as any).role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access the dashboard.
              <br />
              Signed in as {session.user.email}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
