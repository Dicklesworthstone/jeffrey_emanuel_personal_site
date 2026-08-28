"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, useReducedMotion, useInView, AnimatePresence } from "framer-motion";
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
function HeartbeatLine({ active }: { active: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  // Mount the infinite sweep/pulse loops only while the line is on screen and
  // the feed actually has data (no cosmetic liveness while loading/failed).
  const inView = useInView(containerRef, { margin: "100px" });
  const isInView = inView && active;

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
    <div ref={containerRef} className="relative h-12 w-full overflow-hidden" aria-hidden="true">
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
      {isInView && (
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
      )}

      {/* Pulse dot */}
      {isInView && (
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
      )}
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
  windowSaturated,
  status,
  fetchedAt,
  now,
}: {
  eventsToday: number;
  /** All events in the 30-event window landed today, so the count is a lower bound. */
  windowSaturated: boolean;
  status: "loading" | "ready" | "error";
  fetchedAt: Date | null;
  now: Date | null;
}) {
  const hasFreshness = status === "ready" && fetchedAt !== null && now !== null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-center gap-4">
        {/* Freshness indicator - derived from the upstream response time, not cosmetic */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-2 w-2 rounded-full",
              status === "ready" ? "bg-emerald-500" : "bg-slate-500"
            )}
            aria-hidden="true"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {status === "loading" && "Loading"}
            {status === "error" && "Feed unavailable"}
            {status === "ready" && (hasFreshness ? (
              <>
                Updated{" "}
                <time dateTime={fetchedAt.toISOString()}>{formatRelativeTime(fetchedAt, now)}</time>
              </>
            ) : "Recent")}
          </span>
        </div>

        {/* Events today (bounded by the 30-event window GitHub returns) */}
        {status === "ready" && (
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-300">
              {eventsToday}
              {windowSaturated ? "+" : ""}{" "}
              <span className="text-slate-500 font-normal">today</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component
export default function GitHubHeartbeat({ className }: { className?: string }) {
  const [events, setEvents] = useState<HeartbeatEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const fetchedRef = useRef(false);
  // Initialize with null to avoid hydration mismatch, set after mount
  const [now, setNow] = useState<Date | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Set initial time after hydration to avoid mismatch
  useEffect(() => {
    setNow(new Date());
  }, []);

  // Fetch events. Non-OK responses are handled quietly (no throw, no console
  // noise): the card degrades to a labeled "unavailable" state instead.
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    let cancelled = false;

    async function fetchEvents() {
      let response: Response;
      try {
        response = await fetch("/api/github-heartbeat", { headers: { Accept: "application/json" } });
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }

      if (!response.ok) {
        if (!cancelled) setStatus("error");
        return;
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }

      // Accept both the { events, fetchedAt } envelope and a bare array.
      const rawEvents: unknown = Array.isArray(data)
        ? data
        : data && typeof data === "object" && Array.isArray((data as { events?: unknown }).events)
          ? (data as { events: unknown[] }).events
          : null;

      if (!rawEvents) {
        if (!cancelled) setStatus("error");
        return;
      }

      const parsed = (rawEvents as GitHubEvent[])
        .filter((e) =>
          ["PushEvent", "PullRequestEvent", "CreateEvent", "WatchEvent", "ForkEvent"].includes(
            e.type
          )
        )
        .map(parseEvent);

      const fetchedAtRaw =
        data && typeof data === "object" && typeof (data as { fetchedAt?: unknown }).fetchedAt === "string"
          ? Date.parse((data as { fetchedAt: string }).fetchedAt)
          : Date.parse(response.headers.get("date") ?? "");

      if (cancelled) return;
      setEvents(parsed);
      setFetchedAt(Number.isFinite(fetchedAtRaw) ? new Date(fetchedAtRaw) : new Date());
      setStatus("ready");
    }

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update relative time labels once per minute; pause while the tab is hidden
  useEffect(() => {
    let id: number | null = null;
    const start = () => {
      if (id === null) id = window.setInterval(() => setNow(new Date()), 60_000);
    };
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };
    const syncToVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        setNow(new Date());
        start();
      }
    };
    start();
    document.addEventListener("visibilitychange", syncToVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", syncToVisibility);
    };
  }, []);

  const getLocalDayKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Calculate stats. The streak was dropped on purpose: a 30-event window
  // cannot tell a real streak from a busy day, so it was not an honest number.
  const stats = useMemo(() => {
    // Return defaults if now is not yet set (during SSR/hydration)
    if (!now) return { eventsToday: 0, windowSaturated: false };

    const todayKey = getLocalDayKey(now);
    const eventsToday = events.filter((e) => getLocalDayKey(e.timestamp) === todayKey).length;
    const windowSaturated = events.length > 0 && eventsToday === events.length;

    return { eventsToday, windowSaturated };
  }, [events, now, getLocalDayKey]);

  const loading = status === "loading";
  const error = status === "error";

  return (
    <div
      className={cn(
        "relative min-h-[608px] overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6",
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
              <p className="text-xs text-slate-500">Recent public activity</p>
            </div>
          </div>

          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2.5 text-xs font-medium text-slate-400 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <span>@{GITHUB_USERNAME}</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        {/* Heartbeat visualization */}
        <div className="mb-4">
          <HeartbeatLine active={status === "ready" && events.length > 0} />
        </div>

        {/* Stats row */}
        <div className="mb-5">
          <StatsDisplay
            eventsToday={stats.eventsToday}
            windowSaturated={stats.windowSaturated}
            status={status}
            fetchedAt={fetchedAt}
            now={now}
          />
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
              <Clock className="h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="text-sm text-slate-400">Activity feed unavailable</p>
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                See activity on GitHub
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Clock className="h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="text-sm text-slate-400">No recent public activity</p>
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
              className="group flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-emerald-400"
            >
              <span>View full activity</span>
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
