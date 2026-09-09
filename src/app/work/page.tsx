import type { Metadata } from "next";
import { projects } from "@/lib/site";
import { WorkGrid } from "@/components/work-grid";
import { Sculpture } from "@/components/sculpture";
export const metadata: Metadata = {
  title: "Work",
  description:
    "Explore brand identity, web experience, and digital product concepts by DevnPixel.",
  alternates: { canonical: "/work" },
};
export default function Work() {
  return (
    <main id="main" className="section inner-page">
      <div className="work-hero">
        <div>
          <p className="eyebrow">THE EXPLORATION INDEX / 01—03</p>
          <h1>
            Ideas made
            <br />
            <span className="pixel-text">visible.</span>
          </h1>
        </div>
        <Sculpture variant="dna" interactive />
      </div>
      <div className="intro-row">
        <p>
          Thoughtful design. Purposeful development.
          <br />A collection of possibilities, down to the pixel.
        </p>
        <span className="tiny-label">
          CONCEPT SHOWCASE — CLIENT WORK COMING SOON
        </span>
      </div>
      <WorkGrid projects={projects} />
    </main>
  );
}
