import { createArticleSocialImage, getWritingSocialData } from "@/lib/article-social-image";

const article = getWritingSocialData("bakery_algorithm");

export const runtime = "edge";

export const alt = `${article.title} | Jeffrey Emanuel`;
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function Image() {
  return createArticleSocialImage(article, "twitter");
}
