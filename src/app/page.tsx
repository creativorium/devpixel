import Link from "next/link";
import { PixelRoomLoader } from "@/components/pixel-room-loader";
import { ProjectCard } from "@/components/project-card";
import { PixelMark } from "@/components/brand";
import { projects } from "@/lib/site";
import { services } from "@/lib/services";
import { ServiceTicker } from "@/components/service-ticker";
import type { Metadata } from "next";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-top">
          <span className="eyebrow">INDEPENDENT DIGITAL STUDIO</span>
          <span className="status">
            <i /> OPEN FOR COLLABORATION
          </span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>
              Big ideas.
              <br />
              Small <span className="pixel-text">pixels</span>
              <span className="headline-square" />
            </h1>
            <p>
              We turn bold ideas into thoughtful digital
              <br className="desktop-break" /> experiences. A little detail. A
              lasting impression.
            </p>
            <div className="hero-actions">
              <Link href="/work" className="button dark">
                Explore our work <span>↗</span>
              </Link>
              <Link href="/contact" className="text-link">
                Have a project? <span>↗</span>
              </Link>
            </div>
          </div>
          <PixelRoomLoader hero />
        </div>
        <div className="hero-bottom">
          <span>DESIGN WITH INTENT. BUILD WITH PRECISION.</span>
          <a href="#selected">
            SCROLL TO EXPLORE <span>↓</span>
          </a>
          <span className="coordinates">01 / 03</span>
        </div>
      </section>
      <ServiceTicker />
      <section className="section" id="selected">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / SELECTED EXPLORATIONS</p>
            <h2>
              A few things
              <br />
              we’ve <span className="serif">imagined.</span>
            </h2>
          </div>
          <div>
            <p className="section-note">
              A glimpse of what’s possible.
              <br />
              Concepts today. Your project next.
            </p>
            <Link href="/work" className="text-link">
              View all work <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="project-grid">
          {projects.slice(0, 2).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
      <section className="studio-section section">
        <div>
          <p className="eyebrow">02 / SMALL STUDIO. BIG PICTURE.</p>
          <PixelMark className="studio-mark" />
        </div>
        <div>
          <h2>
            Good design is in the details.
            <br />
            Great experiences bring
            <br />
            them <span className="serif">all together.</span>
          </h2>
          <p>
            We’re a digital studio at the intersection of design and
            development. From the first sketch to the final line of code, we
            make every pixel count.
          </p>
          <Link className="text-link" href="/about">
            Meet the studio <span>↗</span>
          </Link>
          <div className="service-list">
            {services.map((s) => (
              <Link href={`/services/${s.slug}`} key={s.slug}>
                {s.name}
                <span>↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
