"use client";

import dynamic from "next/dynamic";

const GitHubHeartbeat = dynamic(() => import("@/components/github-heartbeat"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/50" />
  ),
});

export default function GitHubHeartbeatWrapper({ className }: { className?: string }) {
  return <GitHubHeartbeat className={className} />;
}
