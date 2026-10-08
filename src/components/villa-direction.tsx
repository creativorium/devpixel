"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Showcase } from "@/lib/showcase";
import { villaDirections } from "@/lib/villa-directions";

export function VillaOpening({ s }: { s: Showcase }) {
  const concept = villaDirections[s.slug];
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    if (!preference.matches) {
      root.current
        ?.querySelectorAll<HTMLElement>("[data-villa-enter]")
        .forEach((element, index) => {
          animations.push(
            element.animate(
              [
                { opacity: 0, transform: "translateY(28px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 1100,
                delay: index * 100,
                easing: "cubic-bezier(.16,1,.3,1)",
                fill: "backwards",
              },
            ),
          );
        });
    }
    const cancel = () => animations.forEach((animation) => animation.cancel());
    preference.addEventListener("change", cancel);
    return () => {
      cancel();
      preference.removeEventListener("change", cancel);
    };
  }, []);
  return (
    <section
      ref={root}
      className={`villa-opening villa-opening-${concept.direction}`}
      aria-label={`${s.name} introduction`}
    >
      <div className="villa-opening-photo">
        <Image
          src={`/showcase/${s.image}.jpg`}
          alt={`Illustrative ${s.style.toLowerCase()} setting for ${s.name}`}
          fill
          sizes="(max-width: 760px) 100vw, 80vw"
          priority
        />
      </div>
      <p className="villa-opening-note" data-villa-enter>
        {concept.note}
        <span>PRIVATE VILLA CONCEPT</span>
      </p>
      <div className="villa-opening-copy">
        <span className="villa-signature" data-villa-enter aria-hidden="true">
          {concept.signature}
        </span>
        <h1 data-villa-enter>{s.headline}</h1>
        <p data-villa-enter>{s.intro}</p>
        <a data-villa-enter className="villa-opening-link" href="#collection">
          Discover the house <span aria-hidden="true">↗</span>
        </a>
      </div>
      <a
        className="villa-scroll-cue"
        href="#villa-journey"
        aria-label="Explore the villa story"
      >
        SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
      </a>
      <span className="villa-opening-edition">BALI / 01—03</span>
    </section>
  );
}

export function VillaJourney({ s }: { s: Showcase }) {
  const concept = villaDirections[s.slug];
  const photos = concept.photos ||
    s.gallery || [s.image, "architecture", "interior"];
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const coastTrack = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const chapters = element.querySelectorAll<HTMLElement>(
      "[data-villa-chapter]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(
              Number((entry.target as HTMLElement).dataset.villaChapter),
            );
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
    const reveals = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!preference.matches) {
            const animation = entry.target.animate(
              [
                { opacity: 0.25, transform: "translateY(32px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 1000, easing: "cubic-bezier(.16,1,.3,1)" },
            );
            animations.add(animation);
            animation.finished
              .then(() => animations.delete(animation))
              .catch(() => {});
          }
          reveals.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    element
      .querySelectorAll(".villa-chapter-copy")
      .forEach((copy) => reveals.observe(copy));
    const cancel = () => animations.forEach((animation) => animation.cancel());
    preference.addEventListener("change", cancel);
    return () => {
      observer.disconnect();
      reveals.disconnect();
      cancel();
      preference.removeEventListener("change", cancel);
    };
  }, []);
  if (concept.direction === "architecture") {
    return (
      <section
        ref={root}
        id="villa-journey"
        className="villa-house-index"
        aria-label="Architectural house index"
      >
        <div className="villa-index-heading">
          <span>BATU / SPATIAL STUDIES</span>
          <h2>
            A house,
            <br />
            in three parts.
          </h2>
          <p>Choose a view. Take a closer look.</p>
        </div>
        <div className="villa-index-layout">
          <div
            className="villa-index-controls"
            role="group"
            aria-label="House views"
          >
            {concept.moments.map((moment, index) => (
              <button
                key={moment}
                aria-pressed={active === index}
                aria-controls={`villa-index-panel-${index}`}
                onClick={() => setActive(index)}
              >
                <span>0{index + 1}</span>
                <strong>{moment}</strong>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
            <p>
              HOUSE 01
              <br />
              PERERENAN, BALI
              <br />
              ILLUSTRATIVE STUDY
            </p>
          </div>
          <div className="villa-index-plates">
            {concept.moments.map((moment, index) => (
              <figure
                id={`villa-index-panel-${index}`}
                className="villa-index-plate"
                key={moment}
                hidden={active !== index}
              >
                <div className="villa-index-photo">
                  <Image
                    src={`/showcase/${photos[index]}.jpg`}
                    alt={`Illustrative architectural study: ${moment}`}
                    fill
                    sizes="(max-width: 760px) 100vw, 60vw"
                  />
                </div>
                <figcaption>
                  <span>FIG. 0{index + 1}</span>
                  <div>
                    <h3>{moment}</h3>
                    <p>{concept.chapters[index]}</p>
                  </div>
                  <a href="#collection">House details ↗</a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (concept.direction === "coast") {
    const move = (next: number) => {
      const track = coastTrack.current;
      if (!track) return;
      const cards = track.querySelectorAll<HTMLElement>(".villa-coast-card");
      const index = Math.max(0, Math.min(2, next));
      track.scrollTo({
        left: cards[index].offsetLeft - cards[0].offsetLeft,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    };
    return (
      <section
        ref={root}
        id="villa-journey"
        className="villa-coast-journal"
        aria-label="Coastal photo journal"
      >
        <div className="villa-coast-heading">
          <div>
            <span>A POSTCARD FROM AMED</span>
            <h2>
              Nothing on the agenda.
              <br />
              <em>Everything to enjoy.</em>
            </h2>
          </div>
          <div className="villa-coast-controls">
            <span aria-live="polite">0{active + 1} / 03</span>
            <button
              disabled={active === 0}
              aria-label="Previous coastal moment"
              onClick={() => move(active - 1)}
            >
              ←
            </button>
            <button
              disabled={active === 2}
              aria-label="Next coastal moment"
              onClick={() => move(active + 1)}
            >
              →
            </button>
          </div>
        </div>
        <div
          ref={coastTrack}
          className="villa-coast-track"
          tabIndex={0}
          role="region"
          aria-label="Coastal moments, swipe or use arrow buttons"
          onScroll={() => {
            const track = coastTrack.current;
            if (!track) return;
            const cards =
              track.querySelectorAll<HTMLElement>(".villa-coast-card");
            const step = cards[1].offsetLeft - cards[0].offsetLeft;
            setActive(
              Math.max(0, Math.min(2, Math.round(track.scrollLeft / step))),
            );
          }}
        >
          {concept.moments.map((moment, index) => (
            <article className="villa-coast-card" key={moment}>
              <div className="villa-coast-photo">
                <Image
                  src={`/showcase/${photos[index]}.jpg`}
                  alt={`Illustrative coastal journal: ${moment}`}
                  fill
                  sizes="(max-width: 760px) 88vw, 72vw"
                />
                <span>POSTCARD 0{index + 1}</span>
              </div>
              <div className="villa-chapter-copy">
                <h3>{moment}.</h3>
                <p>{concept.chapters[index]}</p>
                <a href="#request">Stay on the east coast ↗</a>
              </div>
            </article>
          ))}
        </div>
        <p className="villa-coast-hint">
          Take your time. Swipe through the postcards or use the arrows.
        </p>
      </section>
    );
  }
  if (concept.direction === "estate") {
    return (
      <section
        ref={root}
        id="villa-journey"
        className="villa-estate-invitation"
        aria-label="Estate invitation"
      >
        <div className="villa-estate-heading">
          <span>THE ART OF AN UNHURRIED STAY</span>
          <h2>
            A setting.
            <br />
            <em>A shared occasion.</em>
          </h2>
          <p>
            Come for the company.
            <br />
            Stay for the quiet.
          </p>
        </div>
        <div className="villa-estate-layout">
          <div className="villa-estate-frame">
            {concept.moments.map((moment, index) => (
              <div
                key={moment}
                className={`villa-estate-photo ${active === index ? "is-active" : ""}`}
                aria-hidden={active !== index}
              >
                <Image
                  src={`/showcase/${photos[index]}.jpg`}
                  alt={`Illustrative private estate: ${moment}`}
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
              </div>
            ))}
            <span aria-hidden="true">ARCA / PRIVATE ESTATE</span>
          </div>
          <div className="villa-estate-details">
            {concept.moments.map((moment, index) => (
              <details
                key={moment}
                name="estate-moments"
                open={index === 0}
                onToggle={(event) => {
                  if (event.currentTarget.open) setActive(index);
                }}
              >
                <summary>
                  <span>0{index + 1}</span>
                  <h3>{moment}.</h3>
                  <span className="villa-estate-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="villa-estate-detail-copy">
                  <p>{concept.chapters[index]}</p>
                  <a href="#request">Begin a conversation ↗</a>
                </div>
              </details>
            ))}
            <p className="villa-estate-signoff">
              For your people.
              <br />
              <em>For a little longer.</em>
            </p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section
      ref={root}
      id="villa-journey"
      className={`villa-journey villa-journey-${concept.direction}`}
      aria-label="Three moments at the house"
    >
      <div className="villa-journey-heading">
        <span>THE FEELING OF BEING HERE</span>
        <p>
          One place.
          <br />
          <em>Three little moments.</em>
        </p>
      </div>
      <div className="villa-journey-layout">
        <div className="villa-journey-stage">
          <div className="villa-journey-frame">
            {photos.slice(0, 3).map((photo, index) => (
              <div
                className={`villa-journey-photo ${active === index ? "is-active" : ""}`}
                key={`${photo}-${index}`}
                aria-hidden={active !== index}
              >
                <Image
                  src={`/showcase/${photo}.jpg`}
                  alt={`Illustrative ${s.name} moodboard: ${concept.moments[index]}`}
                  fill
                  sizes="(max-width: 760px) 100vw, 55vw"
                />
              </div>
            ))}
            <span className="villa-journey-count" aria-hidden="true">
              0{active + 1} / 03
            </span>
          </div>
          <nav className="villa-chapter-nav" aria-label="Villa story chapters">
            {concept.moments.map((feature, index) => (
              <a
                key={feature}
                href={`#villa-moment-${index}`}
                aria-current={active === index ? "step" : undefined}
              >
                <span>0{index + 1}</span>
                {feature}
              </a>
            ))}
          </nav>
        </div>
        <div className="villa-journey-chapters">
          {concept.moments.map((feature, index) => (
            <article
              id={`villa-moment-${index}`}
              data-villa-chapter={index}
              className="villa-chapter"
              key={feature}
            >
              <div className="villa-chapter-mobile-photo">
                <Image
                  src={`/showcase/${photos[index] || s.image}.jpg`}
                  alt={`Illustrative ${feature.toLowerCase()} at ${s.name}`}
                  fill
                  sizes="100vw"
                />
              </div>
              <div className="villa-chapter-copy">
                <span className="villa-chapter-number">
                  0{index + 1} / {s.location}
                </span>
                <h2>{feature}.</h2>
                <p>{concept.chapters[index]}</p>
                <a href="#request">
                  Imagine your stay <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
