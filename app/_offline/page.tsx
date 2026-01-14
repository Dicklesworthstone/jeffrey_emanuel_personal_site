"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900/50 ring-1 ring-slate-800">
        <WifiOff className="h-8 w-8 text-slate-500" />
      </div>
      
      <h1 className="mb-2 text-2xl font-bold text-white">
        You are offline
      </h1>
      
      <p className="mb-8 max-w-md text-slate-400">
        It looks like you&apos;ve lost your internet connection. 
        Please check your network and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200"
      >
        Try Again
      </button>
    </div>
  );
}