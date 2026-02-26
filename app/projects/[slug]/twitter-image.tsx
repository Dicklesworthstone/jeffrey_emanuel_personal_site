import { notFound } from "next/navigation";
import { createProjectSocialImage, hasProjectSocialData } from "@/lib/project-social-image";

export const runtime = "edge";

export const alt = "Project by Jeffrey Emanuel";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!hasProjectSocialData(slug)) {
    notFound();
  }
  return createProjectSocialImage(slug, "twitter");
}
