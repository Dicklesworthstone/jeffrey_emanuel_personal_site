import React from "react";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Jeffrey Emanuel",
  description: "From hedge funds to AI agent infrastructure. Background and career timeline.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | Jeffrey Emanuel",
    description: "From hedge funds to AI agent infrastructure. Background and career timeline.",
    url: "https://jeffreyemanuel.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Jeffrey Emanuel",
    description: "From hedge funds to AI agent infrastructure. Background and career timeline.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: "Founder & CEO",
    worksFor: {
      "@type": "Organization",
      name: "Lumera Network",
    },
    url: "https://jeffreyemanuel.com/about",
    sameAs: [
      siteConfig.social.x,
      siteConfig.social.github,
      siteConfig.social.linkedin,
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Reed College",
    },
    knowsAbout: ["AI Agents", "Markets", "Software Engineering", "Mathematics", "Finance"],
  };

  return (
    <>
      <JsonLd data={personSchema} />
      {children}
    </>
  );
}
