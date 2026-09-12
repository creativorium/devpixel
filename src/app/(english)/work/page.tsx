import { pageMetadata } from "@/lib/seo";
import { projects } from "@/lib/site";
import { WorkGrid } from "@/components/work-grid";
import { Sculpture } from "@/components/sculpture";
export const metadata = pageMetadata(
  "Web Development Projects & Design Portfolio",
  "Explore DevnPixel client work and design concepts, including website development, payment integration and applications for JW Trading Academy.",
  "/work",
);
export default function Work() {
  return (
    <main id="main" className="section inner-page">
      <div className="work-hero">
        <div>
          <p className="eyebrow">THE WORK INDEX / 01—05</p>
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
          <br />
          Client projects and studio explorations, down to the pixel.
        </p>
        <span className="tiny-label">CLIENT WORK & STUDIO CONCEPTS</span>
      </div>
      <WorkGrid projects={projects} />
    </main>
  );
}
