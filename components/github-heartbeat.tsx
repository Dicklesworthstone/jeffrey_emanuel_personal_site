"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  GitCommit,
  GitPullRequest,
  Star,
  GitFork,
  Activity,
  Code2,
  Sparkles,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/content";

export const GITHUB_USERNAME = siteConfig.social.github.split("/").filter(Boolean).pop() || "Dicklesworthstone";

// Event types we care about
type GitHubEventType =
  | "PushEvent"
  | "PullRequestEvent"
  | "WatchEvent"
  | "ForkEvent"
  | "CreateEvent"
  | "IssuesEvent";

interface GitHubEvent {
  id: string;
  type: GitHubEventType;
  repo: { name: string };
  created_at: string;
  payload: {
    commits?: Array<{ message: string; sha: string }>;
    action?: string;
    ref_type?: string;
    ref?: string;
  };
}

interface HeartbeatEvent {
  id: string;
  type: GitHubEventType;
  repo: string;
  message: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

// Parse GitHub events into our display format
function parseEvent(event: GitHubEvent): HeartbeatEvent {
  const repoName = event.repo?.name || "unknown/repo";
  const repoShort = repoName.replace(`${GITHUB_USERNAME}/`, "");
  const timestamp = new Date(event.created_at);

  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload.commits || [];
      const latestCommit = commits[commits.length - 1];
      return {
        id: event.id,
        type: event.type,
        repo: repoShort,
        message: latestCommit?.message?.split("\n")[0] || "Pushed code",
        timestamp,
        icon: <GitCommit className="h-3.5 w-3.5" />,
        color: "emerald",
      };
    }
    case "PullRequestEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoShort,
        message: event.payload.action ? `PR ${event.payload.action}` : "PR activity",
        timestamp,
        icon: <GitPullRequest className="h-3.5 w-3.5" />,
        color: "violet",
      };
    case "WatchEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoShort,
        message: "Repo starred",
        timestamp,
        icon: <Star className="h-3.5 w-3.5" />,
        color: "amber",
      };
    case "ForkEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoShort,
        message: "Repo forked",
        timestamp,
        icon: <GitFork className="h-3.5 w-3.5" />,
        color: "sky",
      };
    case "CreateEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoShort,
        message: event.payload.ref_type === "branch" ? `Created ${event.payload.ref}` : "Created repo",
        timestamp,
        icon: <Sparkles className="h-3.5 w-3.5" />,
        color: "pink",
      };
    default:
      return {
        id: event.id,
        type: event.type,
        repo: repoShort,
        message: "Activity",
        timestamp,
        icon: <Code2 className="h-3.5 w-3.5" />,
        color: "slate",
      };
  }
}

// Relative time formatter
function formatRelativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Color utilities
const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
    glow: "shadow-sky-500/20",
  },
  pink: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/20",
    glow: "shadow-pink-500/20",
  },
  slate: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    glow: "shadow-slate-500/20",
  },
};

// Animated heartbeat line component
function HeartbeatLine() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="h-12 w-full">
        <svg viewBox="0 0 400 48" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M0 24 L100 24 L120 24 L130 12 L140 36 L150 8 L160 40 L170 24 L180 24 L200 24 L400 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-500/40"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-12 w-full overflow-hidden" aria-hidden="true">
      {/* Static line background */}
      <svg viewBox="0 0 400 48" className="h-full w-full" preserveAspectRatio="none">
        <path
          d="M0 24 L400 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-slate-700/50"
        />
      </svg>

      {/* Animated heartbeat trace */}
      <motion.div
        className="absolute inset-0"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg viewBox="0 0 400 48" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heartbeat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="rgb(16 185 129 / 0.8)" />
              <stop offset="50%" stopColor="rgb(16 185 129 / 1)" />
              <stop offset="70%" stopColor="rgb(16 185 129 / 0.8)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M0 24 L100 24 L120 24 L130 12 L140 36 L150 8 L160 40 L170 24 L180 24 L200 24 L400 24"
            fill="none"
            stroke="url(#heartbeat-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>
      </motion.div>

      {/* Pulse dot */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Single event card
function EventCard({
  event,
  index,
  now,
}: {
  event: HeartbeatEvent;
  index: number;
  now: Date;
}) {
  const prefersReducedMotion = useReducedMotion();
  const colors = colorMap[event.color] || colorMap.slate;

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border p-3 backdrop-blur-sm transition-all duration-300",
        colors.border,
        "bg-slate-900/40 hover:bg-slate-900/60"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-shadow duration-300",
          colors.bg,
          colors.border,
          colors.text,
          "group-hover:shadow-lg",
          colors.glow
        )}
      >
        {event.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-bold uppercase tracking-wider", colors.text)}>
            {event.repo}
          </span>
          <span className="text-xs text-slate-500">
            {formatRelativeTime(event.timestamp, now)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-300">
          {event.message}
        </p>
      </div>
    </motion.div>
  );
}

// Stats display
function StatsDisplay({
  eventsToday,
  streak,
  isLive,
}: {
  eventsToday: number;
  streak: number;
  isLive: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {!prefersReducedMotion && isLive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                isLive ? "bg-emerald-500" : "bg-slate-500"
              )}
            />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isLive ? "Live" : "Offline"}
          </span>
        </div>

        {/* Events today */}
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-300">
            {eventsToday} <span className="text-slate-500 font-normal">today</span>
          </span>
        </div>
      </div>

      {/* Streak badge */}
      {streak > 0 && (
        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
          <span className="text-lg">🔥</span>
          <span className="text-xs font-bold text-amber-400">{streak} day streak</span>
        </div>
      )}
    </div>
  );
}

// Main component
export default function GitHubHeartbeat({ className }: { className?: string }) {
  const [events, setEvents] = useState<HeartbeatEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  // Initialize with null to avoid hydration mismatch, set after mount
  const [now, setNow] = useState<Date | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Set initial time after hydration to avoid mismatch
  useEffect(() => {
    setNow(new Date());
  }, []);

  // Fetch events
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchEvents() {
      try {
        const response = await fetch("/api/github-heartbeat");

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        const parsed = data
          .filter((e) =>
            ["PushEvent", "PullRequestEvent", "CreateEvent", "WatchEvent", "ForkEvent"].includes(
              e.type
            )
          )
          .slice(0, 10)
          .map(parseEvent);

        setEvents(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Update relative time labels once per minute
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const getLocalDayKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    // Return defaults if now is not yet set (during SSR/hydration)
    if (!now) return { eventsToday: 0, streak: 0 };

    const todayKey = getLocalDayKey(now);
    const eventsToday = events.filter((e) => getLocalDayKey(e.timestamp) === todayKey).length;

    // Simple streak calculation (consecutive days with activity)
    const uniqueDays = new Set(events.map((e) => getLocalDayKey(e.timestamp)));
    let streak = 0;
    let checkDate = todayKey;

    while (uniqueDays.has(checkDate)) {
      streak++;
      const [year, month, day] = checkDate.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() - 1);
      checkDate = getLocalDayKey(d);
    }

    return { eventsToday, streak };
  }, [events, now, getLocalDayKey]);

  const isLive = !loading && !error && events.length > 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 backdrop-blur-xl",
        className
      )}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/[0.03] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-violet-500/[0.03] blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitHub Heartbeat</h3>
              <p className="text-xs text-slate-500">Real-time activity feed</p>
            </div>
          </div>

          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <span>@{GITHUB_USERNAME}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Heartbeat visualization */}
        <div className="mb-4">
          <HeartbeatLine />
        </div>

        {/* Stats row */}
        <div className="mb-5">
          <StatsDisplay eventsToday={stats.eventsToday} streak={stats.streak} isLive={isLive} />
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
              />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div className="text-3xl">💤</div>
              <p className="text-sm text-slate-500">Activity feed unavailable</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Clock className="h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          ) : now ? (
            <AnimatePresence mode="popLayout">
              {events.slice(0, 5).map((event, index) => (
                <EventCard key={event.id} event={event} index={index} now={now} />
              ))}
            </AnimatePresence>
          ) : null}
        </div>

        {/* Footer link */}
        {events.length > 0 && (
          <div className="mt-4 border-t border-slate-800/50 pt-4">
            <a
              href={`https://github.com/${GITHUB_USERNAME}?tab=overview`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-400"
            >
              <span>View full activity</span>
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
