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
  if (!hasWritingSocialData("bakery_algorithm")) {
    notFound();
  }
  const article = getWritingSocialData("bakery_algorithm");
  return createArticleSocialImage(article, "twitter");
}
