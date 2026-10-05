import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShowcaseDemo } from "@/components/showcase-demo";
import { showcases } from "@/lib/showcase";

// Permit runtime fallback on Netlify while retaining build-time generation.
// The showcase lookup rejects unknown slugs with notFound().
export const dynamicParams = true;
export function generateStaticParams() {
  return showcases
    .filter((s) => s.category === "Rental" && s.variant)
    .map((s) => ({ slug: s.slug }));
}
function rental(slug: string) {
  const s = showcases.find(
    (s) => s.slug === slug && s.category === "Rental" && s.variant,
  );
  if (!s) notFound();
  return s;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const s = rental((await params).slug);
  return {
    title: `Rental planner — ${s.name} | DevnPixel showcase`,
    description: `Explore the ${s.name} concept in ${s.location}: compare sample equipment, choose dates and preview a rental estimate.`,
    alternates: { canonical: `/showcase/${s.slug}/rentals` },
  };
}
export default async function RentalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ShowcaseDemo concept={rental((await params).slug)} rentalBrowse />;
}
