"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center"
    >
      <div className="mx-auto max-w-md">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 text-sky-400 shadow-lg shadow-sky-900/10">
          <WifiOff className="h-10 w-10" />
        </div>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          You&apos;re Offline
        </h1>

        <p className="mb-8 text-lg leading-relaxed text-slate-400">
          It looks like you&apos;ve lost your internet connection. Some content may still be
          available from your cache, but new pages can&apos;t be loaded right now.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 shadow-sm shadow-slate-900/70 transition-colors hover:border-slate-500 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        <p className="mt-8 text-sm text-slate-500">
          Previously visited pages may still be accessible while offline.
        </p>
      </div>
    </main>
  );
}
