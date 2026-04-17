import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SlackMigrationArticle } from "@/components/slack-migration-article";

export const metadata: Metadata = {
  title: "Using AI Agents and Skills to Migrate Off Slack | Jeffrey Emanuel",
  description:
    "How two paired Claude Code / Codex skills move a company from Slack to a self-hosted Mattermost — end to end, driven by an agent, with a fail-closed readiness gate, a named rollback owner, and 96-99% lower ongoing cost.",
  alternates: {
    canonical: "/writing/slack-mattermost-migration",
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
