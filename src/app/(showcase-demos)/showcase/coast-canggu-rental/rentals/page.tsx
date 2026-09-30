import { ShowcaseDemo } from "@/components/showcase-demo";
import { showcases } from "@/lib/showcase";
export const metadata = {
  title: "Choose a bike — Coast / Go rental demo | DevnPixel",
  description:
    "Explore a sample Bali scooter rental booking: choose your bike, dates and extras.",
  alternates: { canonical: "/showcase/coast-canggu-rental/rentals" },
};
export default function RentalFleetPage() {
  return (
    <ShowcaseDemo
      concept={showcases.find((s) => s.category === "Rental")!}
      rentalBrowse
    />
  );
}
