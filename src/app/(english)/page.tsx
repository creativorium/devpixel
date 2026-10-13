import Link from "next/link";
import { Sculpture } from "@/components/sculpture";
import { ProjectCard } from "@/components/project-card";
import { PixelMark } from "@/components/brand";
import { homeProjects } from "@/lib/site";
import { services } from "@/lib/services";
import { ServiceTicker } from "@/components/service-ticker";
import { posts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Web Design & Development in Bali | DevnPixel",
  "Web design and development for businesses in Bali. DevnPixel builds responsive business websites, villa websites and online stores, with a clear scope and direct collaboration.",
  "/",
);
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
              Web design.
              <br />
              Built for <span className="pixel-text">Bali.</span>
              <span className="headline-square" />
            </h1>
            <p>
              Web design and development for businesses in Bali. We build
              responsive websites that explain your offer and help customers
              enquire, from business profiles to villa websites and online
              stores.
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
          <Sculpture variant="diamond" interactive electrons />
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
            <p className="eyebrow">01 / SELECTED WORK</p>
            <h2>
              A few things
              <br />
              we’ve <span className="serif">created.</span>
            </h2>
          </div>
          <div>
            <p className="section-note">
              Client work and studio explorations.
              <br />
              Built, supported, and imagined.
            </p>
            <Link href="/work" className="text-link">
              View all work <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="project-grid">
          {homeProjects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
      <section className="studio-section section">
        <div className="studio-heading">
          <p className="eyebrow">02 / SMALL STUDIO. BIG PICTURE.</p>
          <h2>
            Good design is in the details.
            <br />
            Great experiences bring
            <br />
            them <span className="serif">all together.</span>
          </h2>
          <PixelMark className="studio-mark" />
        </div>
        <div className="studio-details">
          <p>
            Work directly with an independent studio on website design,
            development, and ongoing maintenance. Our client work includes
            Wonderland Bali, JW Trading Academy, and FZ Film Co.
          </p>
          <Link className="text-link" href="/about">
            Meet the studio <span>↗</span>
          </Link>
          <div className="service-list">
            {services.map((s) => (
              <Link href={`/services/${s.slug}`} key={s.slug}>
                <div>
                  <strong>{s.name}</strong>
                  <p>{s.description}</p>
                </div>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section market-section">
        <div className="market-copy">
          <p className="eyebrow">SMALL STUDIO / INTERNATIONAL PERSPECTIVE</p>
          <h2>
            Web design for Bali.
            <br />
            Built to reach beyond.
          </h2>
          <p>
            Planning a website for your Bali business? We help organise your
            services, photos, and contact information into a website your
            customers can use on mobile and desktop. Forms, WhatsApp enquiries,
            and booking or payment integrations are agreed around your needs.
          </p>
          <p>
            Start with a clear scope: the pages you need, who prepares the
            content, and how the website will be maintained after launch. We
            also work remotely with businesses in Australia, the United States,
            and Singapore.
          </p>
          <Link className="text-link" href="/services">
            Find the right service ↗
          </Link>
        </div>
        <Sculpture variant="frame" />
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Notes from the studio.</h2>
          <Link href="/blog" className="text-link">
            Read the journal ↗
          </Link>
        </div>
        <div className="home-articles">
          {posts.slice(0, 3).map((post) => (
            <article key={post.slug}>
              <p className="eyebrow">{post.category}</p>
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p>{post.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
