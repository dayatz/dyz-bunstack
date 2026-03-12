import { apiFetch } from "#/libs/api";

export interface HealthCheckResponse {
  uptime: number;
  checks: {
    database: { status: string; latency: string };
    storage: { status: string; latency: string };
  };
}

export async function fetchHealthCheck() {
  return apiFetch<HealthCheckResponse>("/health");
}
