import { notFound } from "next/navigation";
import { createArticleSocialImage, getWritingSocialData, hasWritingSocialData } from "@/lib/article-social-image";

export const runtime = "edge";

export const alt = "Writing article by Jeffrey Emanuel";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function Image() {
  if (!hasWritingSocialData("barra-factor-model")) {
    notFound();
  }
  const article = getWritingSocialData("barra-factor-model");
  return createArticleSocialImage(article, "twitter");
}
