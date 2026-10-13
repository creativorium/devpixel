import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShowcaseDemo } from "@/components/showcase-demo";
import { showcases } from "@/lib/showcase";
import { site } from "@/lib/site";
import { StructuredData } from "@/components/structured-data";
// Permit runtime fallback on Netlify while retaining build-time generation.
// The showcase lookup rejects unknown slugs with notFound().
export const dynamicParams = true;
export function generateStaticParams() {
  return showcases.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params,
    s = showcases.find((s) => s.slug === slug);
  if (!s) notFound();
  const title = `${s.name} — ${s.seo} | DevnPixel Showcase`,
    description = `${s.seo}. Explore the ${s.name} concept by DevnPixel, creating websites for local and expat-owned businesses in Bali.`,
    url = `${site.url}/showcase/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        { url: `/showcase/${s.image}.jpg`, alt: `${s.name} website concept` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/showcase/${s.image}.jpg`],
    },
  };
}
export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    s = showcases.find((s) => s.slug === slug);
  if (!s) notFound();
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CreativeWork",
              name: `${s.name} — website design concept`,
              description: s.design,
              genre: "Website design concept",
              inLanguage: "en",
              url: `${site.url}/showcase/${slug}`,
              image: `${site.url}/showcase/${s.image}.jpg`,
              creator: {
                "@type": "Organization",
                name: "DevnPixel",
                url: site.url,
              },
              isAccessibleForFree: true,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Showcase",
                  item: `${site.url}/showcase`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: s.name,
                  item: `${site.url}/showcase/${slug}`,
                },
              ],
            },
          ],
        }}
      />
      <ShowcaseDemo concept={s} />
    </>
  );
}
