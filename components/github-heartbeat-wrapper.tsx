"use client";

import dynamic from "next/dynamic";

const GitHubHeartbeat = dynamic(() => import("@/components/github-heartbeat"), {
  ssr: false,
  loading: () => (
    // Matches the rendered card's min-height so the swap does not shift layout.
    <div
      className="min-h-[608px] rounded-2xl border border-slate-800/60 bg-slate-900/50 motion-safe:animate-pulse"
      aria-hidden="true"
    />
  ),
});

export default function GitHubHeartbeatWrapper({ className }: { className?: string }) {
  return <GitHubHeartbeat className={className} />;
}
