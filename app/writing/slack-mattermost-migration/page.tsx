import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SlackMigrationArticle } from "@/components/slack-migration-article";

const OG_TITLE =
  "Using AI Agents and Skills to Migrate Off Slack | Jeffrey Emanuel";
const OG_DESCRIPTION =
  "How two paired Claude Code / Codex skills move a company from Slack to a self-hosted Mattermost — end to end, driven by an agent, with a fail-closed readiness gate, a named rollback owner, and 96-99% lower ongoing cost.";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESCRIPTION,
  alternates: {
    canonical: "/writing/slack-mattermost-migration",
  },
  // See /writing/wills-and-estate-planning/page.tsx for rationale — static
  // JPEGs under /public/og bypass the slow dynamic route for crawlers.
  // Regenerate with `bun run prerender:og`.
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    type: "article",
    url: "/writing/slack-mattermost-migration",
    images: [
      {
        url: "/og/slack-mattermost-migration-opengraph.jpg",
        width: 1200,
        height: 630,
        alt: OG_TITLE,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/og/slack-mattermost-migration-twitter.jpg",
        width: 1200,
        height: 600,
        alt: OG_TITLE,
      },
    ],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Using AI Agents and Skills to Migrate Off Slack",
  datePublished: "2026-04-16",
  dateModified: "2026-04-16",
  description:
    "How two paired Claude Code / Codex skills move a company from Slack to a self-hosted Mattermost — end to end, driven by an agent, with a fail-closed readiness gate, a named rollback owner, and 96-99% lower ongoing cost.",
  author: {
    "@type": "Person",
    name: "Jeffrey Emanuel",
    url: "https://jeffreyemanuel.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Jeffrey Emanuel",
    logo: {
      "@type": "ImageObject",
      url: "https://jeffreyemanuel.com/icon-192.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://jeffreyemanuel.com/writing/slack-mattermost-migration",
  },
  about: [
    { "@type": "Thing", name: "Slack Migration" },
    { "@type": "Thing", name: "Mattermost" },
    { "@type": "Thing", name: "AI Agents" },
    { "@type": "Thing", name: "Agent Skills" },
    { "@type": "Thing", name: "Self-Hosted Infrastructure" },
    { "@type": "Thing", name: "Claude Code" },
    { "@type": "Thing", name: "Codex" },
  ],
};

export default function SlackMigrationPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <SlackMigrationArticle />
    </>
  );
}
