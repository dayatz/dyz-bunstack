import { RouteErrorDisplay } from "@dyz-bunstack-app/ui";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function RouteError({ error, reset }: ErrorComponentProps) {
  return <RouteErrorDisplay error={error} reset={reset} fullPage />;
}
