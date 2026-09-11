import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { publicPaths } from "@/lib/language-routes";
import { locales, localizedPath } from "@/lib/i18n";
export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: site.url + localizedPath(path, locale),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            l === "zh" ? "zh-Hans" : l,
            site.url + localizedPath(path, l),
          ]),
        ),
      },
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
  );
}
