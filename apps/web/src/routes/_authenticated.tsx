import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "#/libs/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
    return { session };
  },
  component: () => <Outlet />,
});
