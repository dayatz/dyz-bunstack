import * as React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <RouteErrorDisplay
          error={this.state.error!}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

// --- Route error display (works with TanStack Router errorComponent) ---

interface RouteErrorDisplayProps {
  error: Error;
  reset?: () => void;
  fullPage?: boolean;
}

function isApiError(
  error: Error,
): error is Error & { statusCode: number; code: string; details?: unknown } {
  return (
    error.name === "ApiError" &&
    "statusCode" in error &&
    typeof (error as Record<string, unknown>).statusCode === "number"
  );
}

export function RouteErrorDisplay({
  error,
  reset,
  fullPage,
}: RouteErrorDisplayProps) {
  const isDev =
    typeof import.meta !== "undefined" &&
    (import.meta as Record<string, unknown>).env &&
    (import.meta.env as Record<string, unknown>).DEV;

  if (isDev) {
    return <DevErrorOverlay error={error} reset={reset} fullPage={fullPage} />;
  }

  return <ProdErrorFallback error={error} reset={reset} fullPage={fullPage} />;
}

function DevErrorOverlay({
  error,
  reset,
  fullPage,
}: RouteErrorDisplayProps) {
  const apiError = isApiError(error) ? error : null;

  return (
    <div
      className={`${fullPage ? "min-h-screen" : "min-h-[300px]"} flex items-center justify-center bg-black/95 p-6`}
    >
      <div className="w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
            {apiError ? `${apiError.statusCode} Error` : "Error"}
          </span>
          <span className="text-sm text-zinc-500 font-mono">
            {error.name}
          </span>
        </div>

        {/* Message */}
        <h2 className="text-lg font-semibold text-white">{error.message}</h2>

        {/* API error details */}
        {apiError && (
          <div className="flex gap-2 flex-wrap">
            <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300">
              code: {apiError.code}
            </span>
            <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300">
              status: {apiError.statusCode}
            </span>
            {apiError.details && (
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300">
                details: {JSON.stringify(apiError.details)}
              </span>
            )}
          </div>
        )}

        {/* Stack trace */}
        {error.stack && (
          <pre className="max-h-[300px] overflow-auto rounded-lg bg-zinc-900 p-4 text-xs font-mono text-zinc-400 leading-relaxed">
            {error.stack}
          </pre>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Try again
            </button>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}

function ProdErrorFallback({
  error,
  reset,
  fullPage,
}: RouteErrorDisplayProps) {
  const apiError = isApiError(error) ? error : null;

  return (
    <div
      className={`flex ${fullPage ? "min-h-screen" : "min-h-[200px]"} flex-col items-center justify-center gap-4 p-8 text-center`}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || "An unexpected error occurred"}
        </p>
        {apiError && (
          <p className="text-xs font-mono text-muted-foreground/60">
            {apiError.statusCode} &middot; {apiError.code}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
