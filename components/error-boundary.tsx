"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<
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
    console.error("Error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="mx-auto flex min-h-[400px] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-50">
            Something went wrong
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {this.state.error?.message ||
              "An unexpected error occurred while rendering this section."}
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm shadow-slate-900/70 hover:border-slate-500 hover:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Reload page
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-8 w-full rounded-lg border border-slate-800/80 bg-slate-950/80 p-4 text-left">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-400">
                Error details (dev only)
              </summary>
              <pre className="mt-3 overflow-auto text-xs text-slate-500">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
