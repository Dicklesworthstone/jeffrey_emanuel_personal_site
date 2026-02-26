import { getProjectBySlug } from "@/lib/content";
import { createArticleSocialImage, type SocialImageVariant, type WritingSocialData } from "@/lib/article-social-image";

function projectKindLabel(kind: string): string {
  if (kind === "oss") return "Open Source Project";
  if (kind === "product") return "Product";
  if (kind === "research") return "Research";
  if (kind === "rust-port") return "Rust Port";
  return "Project";
}

export function hasProjectSocialData(slug: string): boolean {
  const normalizedSlug = slug.trim();
  return Boolean(normalizedSlug && getProjectBySlug(normalizedSlug));
}

export function getProjectSocialData(slug: string): WritingSocialData {
  const normalizedSlug = slug.trim();
  const project = getProjectBySlug(normalizedSlug);

  if (!project) {
    const resolved = normalizedSlug || "(empty)";
    throw new Error(`[project-social-image] Unknown project slug: ${resolved}`);
  }

  const topTags = project.tags.slice(0, 3).join(" • ");
  const excerptBase = project.short || project.description;
  const excerpt = topTags ? `${excerptBase} ${topTags}.` : excerptBase;

  return {
    slug: `project-${normalizedSlug}`,
    title: project.name,
    excerpt,
    category: projectKindLabel(project.kind),
  };
}

export function createProjectSocialImage(slug: string, variant: SocialImageVariant) {
  return createArticleSocialImage(getProjectSocialData(slug), variant);
}
