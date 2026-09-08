import type { Metadata } from "next";
import Link from "next/link";
import { Sculpture } from "@/components/sculpture";
import { services } from "@/lib/services";
export const metadata: Metadata = {
  title: "The studio",
  description:
    "Meet DevnPixel, an independent studio connecting thoughtful design and purposeful development.",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <main id="main" className="section inner-page">
      <p className="eyebrow">HELLO, WE’RE DEVNPIXEL.</p>
      <h1>
        Small by design.
        <br />
        <span className="pixel-text">Bold by nature.</span>
      </h1>
      <div className="about-feature">
        <Sculpture variant="diamond" interactive />
        <div>
          <p className="eyebrow">DESIGNERS. DEVELOPERS. DETAIL PEOPLE.</p>
          <h2>
            One studio.
            <br />
            Every little detail.
          </h2>
          <p>
            We believe the best digital experiences come from a close
            conversation between design and technology. We bring both to the
            same table.
          </p>
          <p>
            Our approach is simple: understand what matters, question what
            doesn’t, and craft something that feels unmistakably yours.
          </p>
          <Link href="/contact" className="text-link">
            Let’s work together ↗
          </Link>
        </div>
      </div>
      <section className="studio-playground" aria-labelledby="playground-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE ROOM TO PLAY</p>
            <h2 id="playground-title">
              Same pixels.
              <br />
              New possibilities.
            </h2>
          </div>
          <p className="section-note">
            Move your pointer to explore.
            <br />
            Pull the pieces apart. Put them back together.
          </p>
        </div>
        <div className="object-gallery">
          {(["frame", "steps", "cross"] as const).map((variant, i) => (
            <article key={variant}>
              <Sculpture variant={variant} interactive />
              <div className="object-caption">
                <h3>
                  {
                    [
                      "Find a new angle.",
                      "Build on an idea.",
                      "Make a connection.",
                    ][i]
                  }
                </h3>
                <p>
                  {
                    [
                      "Space to frame a different perspective.",
                      "Small steps, something bigger.",
                      "Different directions. One shared centre.",
                    ][i]
                  }
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="values">
        {[
          [
            "01",
            "Think clearly.",
            "Start with the right questions. Build a thoughtful strategy before putting pixels on a screen.",
          ],
          [
            "02",
            "Make it matter.",
            "Create a visual language with purpose. Every interaction, every typeface, every detail.",
          ],
          [
            "03",
            "Build it well.",
            "Bring it to life with accessible, responsive development and performance in mind.",
          ],
        ].map(([n, t, d]) => (
          <article key={n}>
            <span className="eyebrow">{n} / OUR APPROACH</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
      <section className="studio-services">
        <h2>Let’s put it into practice.</h2>
        <div className="service-list">
          {services.map((s) => (
            <Link href={`/services/${s.slug}`} key={s.slug}>
              {s.name}
              <span>↗</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
