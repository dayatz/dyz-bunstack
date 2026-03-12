const API_URL = "/api";

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let body: ApiErrorResponse | null = null;
    try {
      body = await res.json();
    } catch {}

    if (body?.error) {
      throw new ApiError(
        body.error.statusCode,
        body.error.message,
        body.error.code,
        body.error.details,
      );
    }

    throw new ApiError(res.status, res.statusText, "UNKNOWN_ERROR");
  }

  return res.json();
}
