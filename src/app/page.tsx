import Link from "next/link";
import { Sculpture } from "@/components/sculpture";
import { ProjectCard } from "@/components/project-card";
import { PixelMark } from "@/components/brand";
import { projects } from "@/lib/site";
import { services } from "@/lib/services";
import { ServiceTicker } from "@/components/service-ticker";
import { posts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Web Design & Development for Bali and Beyond",
  "Independent web design and development for small businesses in Bali, Australia, the US and Singapore. Explore focused websites, branding and creative services.",
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
      <section className="section market-section">
        <div className="market-copy">
          <p className="eyebrow">SMALL STUDIO / INTERNATIONAL PERSPECTIVE</p>
          <h2>
            Web design for Bali.
            <br />
            Built to reach beyond.
          </h2>
          <p>
            We offer web design, development, and branding for small businesses
            targeting Bali, Australia, the United States, and Singapore. Work
            directly with an independent studio through a clear remote process,
            from the first brief to launch.
          </p>
          <p>
            Looking for affordable web design or a freelance web development
            partner? Start with a focused scope: the right pages, useful
            content, and a reliable way for customers to contact you.
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
