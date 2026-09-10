import type { Metadata } from "next";
import { site } from "./site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${site.url}${path}`,
      siteName: site.name,
      type: "website",
      images: [`${site.url}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${site.url}/opengraph-image`],
    },
  };
}
