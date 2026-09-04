"use client";

import dynamic from "next/dynamic";

type Variant = "homepage" | "project" | "compact";

/**
 * Neutral placeholder that reserves the space the avatar strip will occupy so
 * the ssr:false swap does not shift layout (same idea as
 * github-heartbeat-wrapper). Sizes mirror AvatarStrip in notable-stargazers:
 * compact = five h-8 avatars overlapping by -space-x-2; project = the same
 * strip at h-10 inside the bordered, padded card with its title row.
 */
function StargazersSkeleton({ variant }: { variant: Variant }) {
  const strip = (size: "h-8 w-8" | "h-10 w-10", overlap: string) => (
    <div className={`flex ${overlap}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`${size} animate-pulse rounded-full bg-white/5`} />
      ))}
    </div>
  );

  if (variant === "compact") {
    return (
      <div className="flex min-h-8 items-center" aria-hidden="true">
        {strip("h-8 w-8", "-space-x-2")}
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-slate-800/50 bg-slate-900/30 p-4"
      aria-hidden="true"
    >
      <div className="mb-3 h-5 w-36 animate-pulse rounded bg-white/5" />
      {strip("h-10 w-10", "-space-x-3")}
    </div>
  );
}

// Client-side only import with no SSR. One dynamic() per variant so the
// loading placeholder can match the height that variant will render at.
const makeLoader = (variant: Variant) =>
  dynamic(() => import("@/components/notable-stargazers"), {
    ssr: false,
    loading: () => <StargazersSkeleton variant={variant} />,
  });

const NotableStargazersByVariant: Record<Variant, ReturnType<typeof makeLoader>> = {
  homepage: makeLoader("homepage"),
  project: makeLoader("project"),
  compact: makeLoader("compact"),
};

interface NotableStargazersWrapperProps {
  variant?: Variant;
  repoSlug?: string;
  maxItems?: number;
  showStats?: boolean;
  showCompanies?: boolean;
  className?: string;
}

/**
 * Client wrapper for NotableStargazers component.
 * Required because the main component uses Framer Motion and needs client-side rendering.
 */
export default function NotableStargazersWrapper(props: NotableStargazersWrapperProps) {
  const NotableStargazers = NotableStargazersByVariant[props.variant ?? "homepage"];
  return <NotableStargazers {...props} />;
}
