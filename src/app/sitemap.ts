import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return ["", "/vegetables", "/markets", "/markets/prices", "/listings", "/about"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
