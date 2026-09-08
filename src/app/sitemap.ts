import type { MetadataRoute } from "next";
import { site, projects } from "@/lib/site";
import { services } from "@/lib/services";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/work",
    "/about",
    "/contact",
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
    ...projects.map((p) => `/work/${p.slug}`),
  ].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
