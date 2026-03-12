import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Agentation } from "agentation";
import { ErrorBoundary, Toaster } from "@dyz-bunstack-app/ui";
import { RouteError } from "#/components/route-error";

import "../styles.css";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  errorComponent: RouteError,
});

function RootComponent() {
  return (
    <>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
      <Toaster position="bottom-right" richColors />
      {import.meta.env.DEV && <Agentation />}
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}

