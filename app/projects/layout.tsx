import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects | Jeffrey Emanuel",
  description: "A catalog of experiments, open source tools, and products. The Agentic Coding Tooling Flywheel, Lumera Network, and more.",
  openGraph: {
    title: "Projects | Jeffrey Emanuel",
    description: "A catalog of experiments, open source tools, and products. The Agentic Coding Tooling Flywheel, Lumera Network, and more.",
    url: "https://jeffreyemanuel.com/projects",
  },
};

// Map project kinds to Schema.org application categories
function getApplicationCategory(kind: string, tags: string[]): string {
  if (tags.includes("Agents") || tags.includes("MCP")) return "DeveloperApplication";
  if (tags.includes("Search")) return "UtilitiesApplication";
  if (tags.includes("Education")) return "EducationalApplication";
  if (tags.includes("Finance")) return "FinanceApplication";
  if (kind === "research") return "EducationalApplication";
  return "DeveloperApplication";
}

// Map project to operating system based on tags
function getOperatingSystem(tags: string[]): string {
  if (tags.includes("WASM")) return "Web Browser";
  if (tags.includes("Windows") || tags.includes("NTFS")) return "Windows";
  if (tags.includes("Linux") || tags.includes("WSL")) return "Linux";
  return "Cross-platform";
}

// Map project to programming language based on tags
function getProgrammingLanguage(tags: string[]): string | undefined {
  const langMap: Record<string, string> = {
    "Rust": "Rust",
    "Python": "Python",
    "Go": "Go",
    "TypeScript": "TypeScript",
    "JAX": "Python",
    "PyTorch": "Python",
  };
  for (const tag of tags) {
    if (langMap[tag]) return langMap[tag];
  }
  return undefined;
}

// Extract star count from badge if present
function extractStarCount(badge?: string): number | undefined {
  if (!badge) return undefined;
  const match = badge.match(/(\d+(?:,\d+)?)\s*stars?/i);
  if (match) {
    return parseInt(match[1].replace(",", ""), 10);
  }
  return undefined;
}

// Generate SoftwareApplication schema for a project
function generateSoftwareApplicationSchema(project: typeof projects[number]) {
  const stars = extractStarCount(project.badge);
  const programmingLanguage = getProgrammingLanguage(project.tags);

  const schema: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "name": project.name,
    "description": project.description,
    "url": project.href,
    "applicationCategory": getApplicationCategory(project.kind, project.tags),
    "operatingSystem": getOperatingSystem(project.tags),
    "author": {
      "@type": "Person",
      "name": "Jeffrey Emanuel",
      "url": "https://jeffreyemanuel.com",
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
  };

  if (programmingLanguage) {
    schema["programmingLanguage"] = programmingLanguage;
  }

  // Add aggregate rating if we have star count (GitHub stars as social proof)
  if (stars && stars > 50) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": Math.min(5, 4 + (stars / 1000) * 0.5).toFixed(1),
      "ratingCount": stars,
      "bestRating": "5",
      "worstRating": "1",
    };
  }

  return schema;
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  // Filter for software projects (oss and product kinds)
  const softwareProjects = projects.filter(
    (p) => p.kind === "oss" || p.kind === "product"
  );

  // Generate ItemList schema with all software applications
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Jeffrey Emanuel's Software Projects",
    "description": "A collection of open source tools, developer utilities, and products for AI agents, optimization, and developer productivity.",
    "numberOfItems": softwareProjects.length,
    "itemListElement": softwareProjects.map((project, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": generateSoftwareApplicationSchema(project),
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      {children}
    </>
  );
}
