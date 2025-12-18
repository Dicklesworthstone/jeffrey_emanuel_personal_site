"use client";

import dynamic from "next/dynamic";

// Client-side only import with no SSR
const NotableStargazers = dynamic(
  () => import("@/components/notable-stargazers"),
  { ssr: false }
);

interface NotableStargazersWrapperProps {
  variant?: "homepage" | "project" | "compact";
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
  return <NotableStargazers {...props} />;
}
