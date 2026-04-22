import { notFound } from "next/navigation";
import { createArticleSocialImage, getWritingSocialData, hasWritingSocialData } from "@/lib/article-social-image";

export const runtime = "edge";

export const alt = "Writing article by Jeffrey Emanuel";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  if (!hasWritingSocialData("wills-and-estate-planning")) {
    notFound();
  }
  const article = getWritingSocialData("wills-and-estate-planning");
  return createArticleSocialImage(article, "opengraph");
}
