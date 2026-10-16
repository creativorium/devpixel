"use client";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { showcaseContact } from "@/lib/showcase";

function Heading({ text, hero = false }: { text: string; hero?: boolean }) {
  const Tag = hero ? "h1" : "h2";
  return (
    <Tag className="ae-heading" data-ae-heading aria-label={text}>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span aria-hidden="true" className="ae-word">
            {Array.from(word).map((letter, j) => (
              <span className="ae-letter" key={j}>
                {letter}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
const chapters = [
  {
    name: "Stay",
    title: "A room for the quiet part of you.",
    body: "A private two-bedroom villa concept, with open living space and a sheltered terrace. Somewhere to unpack, settle in, and leave a little room in the day.",
    photo: "architecture",
    alt: "Light-filled living space opening onto a terrace",
    caption: "THE PRIVATE HOUSE / ROOM TO EXHALE",
  },
  {
    name: "Pause",
    title: "Well-being, at your own pace.",
    body: "Make room for a morning stretch, a slow swim, or simply a book left open in the shade. These are suggestions for a gentler day, without programmes or promises.",
    photo: "wellness",
    alt: "An outdoor morning stretch in soft evening light",
    caption: "YOUR OWN RHYTHM / NOTHING TO KEEP UP WITH",
  },
  {
    name: "Wander",
    title: "Let the outside find its way in.",
    body: "An Ubud-inspired setting, imagined among trees and tropical gardens. Step onto the terrace, follow the light, and let curiosity set the pace.",
    photo: "retreat",
    alt: "A pool surrounded by a lush tropical canopy",
    caption: "THE LANDSCAPE / A LITTLE CLOSER TO NATURE",
  },
];
export function AeraShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0),
    [menu, setMenu] = useState(false),
    [notice, setNotice] = useState("");
  const selected = chapters[chapter];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        root.current
          ?.querySelectorAll<HTMLElement>("[data-ae-heading]")
          .forEach((heading) =>
            gsap.from(heading.querySelectorAll(".ae-letter"), {
              yPercent: 80,
              opacity: 0,
              duration: 1,
              stagger: 0.012,
              ease: "power3.out",
              scrollTrigger: { trigger: heading, start: "top 94%", once: true },
            }),
          );
        root.current
          ?.querySelectorAll<HTMLElement>("[data-ae-reveal]")
          .forEach((element) =>
            gsap.from(element, {
              y: 35,
              opacity: 0,
              duration: 1.1,
              ease: "power2.out",
              scrollTrigger: { trigger: element, start: "top 90%", once: true },
            }),
          );
        gsap.from(".ae-hero-photo", {
          scale: 1.06,
          duration: 2.2,
          ease: "power2.out",
        });
        gsap.fromTo(
          ".ae-scroll-phrase",
          { xPercent: 7 },
          {
            xPercent: -5,
            ease: "none",
            scrollTrigger: {
              trigger: ".ae-phrase-wrap",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      }, root);
      return () => ctx.revert();
    });
    return () => media.revert();
  }, []);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(
        () =>
          gsap.from(".ae-chapter-image,.ae-chapter-text", {
            opacity: 0.3,
            y: 10,
            duration: 0.6,
            ease: "power2.out",
          }),
        root,
      );
      return () => ctx.revert();
    });
    return () => media.revert();
  }, [chapter]);
  return (
    <div
      className="ae-site"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenu(false);
      }}
    >
      <a className="ae-skip" href="#main">
        Skip to content
      </a>
      <aside className="ae-studio">
        <Link href="/showcase">← DevnPixel showcase</Link>
        <span>AN INDEPENDENT VILLA CONCEPT</span>
        <Link href={showcaseContact("aera-ubud-sanctuary")}>
          Create your own ↗
        </Link>
      </aside>
      <main id="main">
        <section className="ae-hero">
          <Image
            src="/showcase/retreat.jpg"
            alt="Tropical canopy and a secluded pool in a lush Ubud-inspired setting"
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="ae-hero-photo"
          />
          <div className="ae-hero-overlay" />
          <header className="ae-nav">
            <a className="ae-brand" href="#main" aria-label="AERA home">
              A E R A<span>UBUD / BALI</span>
            </a>
            <nav aria-label="Villa navigation">
              <a href="#introduction">The sanctuary</a>
              <a href="#chapters">Ways of being</a>
              <a href="#house">The private house</a>
            </nav>
            <a className="ae-link-button" href="#begin">
              Begin your stay <span>↗</span>
            </a>
            <button
              className="ae-menu-button"
              aria-expanded={menu}
              aria-controls="ae-mobile-menu"
              onClick={() => setMenu(!menu)}
            >
              {menu ? "Close −" : "Menu +"}
            </button>
          </header>
          {menu && (
            <nav
              className="ae-mobile-menu"
              id="ae-mobile-menu"
              aria-label="Mobile villa navigation"
            >
              {[
                ["#introduction", "The sanctuary"],
                ["#chapters", "Ways of being"],
                ["#house", "The private house"],
                ["#begin", "Begin your stay"],
              ].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenu(false)}>
                  {label} ↗
                </a>
              ))}
            </nav>
          )}
          <div className="ae-hero-copy">
            <span className="ae-label">
              A PRIVATE SANCTUARY, CLOSE TO NATURE.
            </span>
            <Heading hero text="Return to what matters." />
            <div>
              <p>
                A little space to reconnect.
                <br />
                With the landscape. With each other. With yourself.
              </p>
              <a
                href="#introduction"
                className="ae-down"
                aria-label="Explore the sanctuary"
              >
                ↓
              </a>
            </div>
          </div>
        </section>
        <section className="ae-introduction" id="introduction">
          <span className="ae-label">01 / A DIFFERENT KIND OF ARRIVAL</span>
          <div>
            <Heading text="Not another place to go. A place to come back to yourself." />
            <p>
              Somewhere between the trees and the quiet, the day begins to feel
              like your own. AERA imagines a private villa stay shaped by
              natural light, considered spaces, and the simple pleasure of
              slowing down.
            </p>
          </div>
          <figure data-ae-reveal>
            <div>
              <Image
                src="/showcase/architecture.jpg"
                alt="Open timber and glass living spaces filled with natural light"
                fill
                sizes="(max-width:700px) 90vw, 60vw"
              />
            </div>
            <figcaption>OPEN SPACE. A QUIETER PERSPECTIVE.</figcaption>
          </figure>
        </section>
        <div className="ae-phrase-wrap" aria-hidden="true">
          <div className="ae-scroll-phrase">Nature. Space. You.</div>
        </div>
        <section className="ae-chapters" id="chapters">
          <div className="ae-chapter-nav">
            <span className="ae-label">02 / WAYS OF BEING</span>
            <p>
              Less itinerary.
              <br />
              More possibility.
            </p>
            <div role="tablist" aria-label="Explore AERA">
              {chapters.map((item, index) => (
                <button
                  key={item.name}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  id={`ae-tab-${index}`}
                  role="tab"
                  aria-selected={chapter === index}
                  aria-controls="ae-chapter-panel"
                  tabIndex={chapter === index ? 0 : -1}
                  onClick={() => setChapter(index)}
                  onKeyDown={(event) => {
                    let next = index;
                    if (event.key === "ArrowRight" || event.key === "ArrowDown")
                      next = (index + 1) % chapters.length;
                    else if (
                      event.key === "ArrowLeft" ||
                      event.key === "ArrowUp"
                    )
                      next = (index + chapters.length - 1) % chapters.length;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = chapters.length - 1;
                    else return;
                    event.preventDefault();
                    setChapter(next);
                    tabs.current[next]?.focus();
                  }}
                >
                  <span>0{index + 1}</span>
                  {item.name}
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>
          <div
            className="ae-chapter-panel"
            id="ae-chapter-panel"
            role="tabpanel"
            aria-labelledby={`ae-tab-${chapter}`}
          >
            <div className="ae-chapter-image">
              <Image
                key={selected.photo}
                src={`/showcase/${selected.photo}.jpg`}
                alt={selected.alt}
                fill
                sizes="(max-width:700px) 100vw, 65vw"
              />
            </div>
            <div className="ae-chapter-text">
              <span className="ae-label">{selected.caption}</span>
              <h2>{selected.title}</h2>
              <p>{selected.body}</p>
              <a className="ae-text-link" href="#begin">
                Make room for this ↗
              </a>
            </div>
          </div>
        </section>
        <section className="ae-nature">
          <div className="ae-nature-image" data-ae-reveal>
            <Image
              src="/showcase/retreat.jpg"
              alt="A quiet pool beneath palms and tropical trees"
              fill
              sizes="(max-width:700px) 90vw, 45vw"
            />
          </div>
          <div>
            <span className="ae-label">03 / THE WORLD OUTSIDE</span>
            <Heading text="Let the landscape lead." />
            <p>
              Shade at midday. The sound of leaves. A slower swim. This retreat
              concept places the natural setting at the centre of the stay, with
              space for ordinary moments to become the memorable ones.
            </p>
            <a className="ae-text-link" href="#house">
              Discover the private house ↗
            </a>
          </div>
        </section>
        <section className="ae-house" id="house">
          <span className="ae-label">04 / YOUR PLACE IN IT ALL</span>
          <div className="ae-house-heading">
            <Heading text="A house for staying in." />
            <p>
              An intimate villa concept for a few good days together. The useful
              details, without the noise.
            </p>
          </div>
          <div className="ae-house-photo">
            <Image
              src="/showcase/interior.jpg"
              alt="Comfortable seating and a timber table in a sunlit private living room"
              fill
              sizes="90vw"
            />
          </div>
          <dl>
            {[
              ["The setting", "An Ubud-inspired tropical retreat"],
              ["The house", "Two-bedroom private villa concept"],
              ["Your people", "Up to four guests, together"],
              ["The details", "Kitchen, shared living and pool concept"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="ae-fine">
            Illustrative setting and amenities. For a live property, confirm
            exact location, access, inclusions and pool safety with the host.
          </p>
        </section>
        <section className="ae-begin" id="begin">
          <div>
            <span className="ae-label">05 / A LITTLE CLOSER</span>
            <Heading text="Your slower chapter starts here." />
            <p>Tell us the kind of stay you have in mind.</p>
          </div>
          <form
            onChange={() => setNotice("")}
            onSubmit={(event) => {
              event.preventDefault();
              setNotice(
                "Your sample enquiry is ready. This fictional villa concept does not send messages or reserve a stay.",
              );
            }}
          >
            <label>
              Your name
              <input
                name="name"
                placeholder="Full name"
                required
                maxLength={100}
                autoComplete="name"
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                placeholder="Email address"
                type="email"
                required
                autoComplete="email"
              />
            </label>
            <label>
              I’m making room for
              <select name="intention">
                <option>A quiet getaway</option>
                <option>Time with my people</option>
                <option>A creative pause</option>
              </select>
            </label>
            <label>
              A little about your plans
              <textarea
                name="message"
                rows={2}
                placeholder="Your dates, your people, your kind of day…"
                maxLength={2000}
              />
            </label>
            <button className="ae-link-button" type="submit">
              Preview enquiry <span>↗</span>
            </button>
            <p role="status">{notice}</p>
          </form>
        </section>
      </main>
      <footer className="ae-footer">
        <div className="ae-footer-brand">
          A E R A<span>A LITTLE MORE CONNECTED.</span>
        </div>
        <div>
          <p>
            Fictional villa concept by DevnPixel. Illustrative photography.
            <br />
            No stays, programmes or enquiries are booked through this preview.
          </p>
          <Link href={showcaseContact("aera-ubud-sanctuary")}>
            A website for your own place ↗
          </Link>
        </div>
        <a href="#main">Back to top ↑</a>
      </footer>
    </div>
  );
}
