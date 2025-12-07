import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Point Turbopack at the monorepo root so it can resolve workspace deps.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
