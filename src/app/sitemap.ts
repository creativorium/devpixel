import type { MetadataRoute } from "next";
import { site, projects } from "@/lib/site";
import { services } from "@/lib/services";
import { posts } from "@/lib/posts";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/work",
    "/about",
    "/contact",
    "/services",
    "/privacy",
    "/terms",
    "/blog",
    ...posts.map((p) => `/blog/${p.slug}`),
    ...services.map((s) => `/services/${s.slug}`),
    ...projects.map((p) => `/work/${p.slug}`),
  ].map((path) => ({
    url: `${site.url}${path}`,
    ...(path.startsWith("/blog/") ? { lastModified: "2026-09-10" } : {}),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
