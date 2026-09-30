import { ShowcaseIndex } from "@/components/showcase-index";
import { pageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";
import { showcases } from "@/lib/showcase";
import { site } from "@/lib/site";
export const metadata = pageMetadata(
  "Bali Website Design Showcase: Hotels, Shops, Villas & Spas",
  "Website design inspiration for local and expat-owned businesses in Bali. Explore hotel, villa, restaurant, shop, rental and spa concepts by DevnPixel.",
  "/showcase",
);
export default function ShowcasePage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Bali website design concepts by DevnPixel",
          itemListElement: showcases.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `${site.url}/showcase/${s.slug}`,
          })),
        }}
      />
      <ShowcaseIndex />
    </>
  );
}
