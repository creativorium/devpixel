import type { Metadata } from "next";
import { VillaBumiPreview } from "@/components/villabumi-preview";
import "./villabumi.css";

export const metadata: Metadata = {
  title: "Villa Bumi — A hillside retreat above the Bukit | Design preview",
  description:
    "Explore the Villa Bumi website redesign preview: three bedrooms, a private pool and ocean views in Pecatu, Bali.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/showcase/villabumi" },
  openGraph: {
    title: "Villa Bumi — Website design preview",
    description:
      "A hillside retreat above the Bukit. A new design direction for Villa Bumi, Pecatu, Bali.",
    images: [
      {
        url: "/villabumi/sunset.webp",
        width: 1800,
        height: 1200,
        alt: "Villa Bumi pool terrace",
      },
    ],
  },
};

export default function VillaBumiPreviewPage() {
  return <VillaBumiPreview />;
}
