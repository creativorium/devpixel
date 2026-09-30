"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { showcases, showcaseContact, type Showcase } from "@/lib/showcase";
import {
  ShopExperience,
  RentalExperience,
  RestaurantExperience,
  SpaExperience,
  HotelExperience,
  VillaExperience,
} from "./showcase-experiences";

export function ShowcaseDemo({
  concept: s,
  rentalBrowse = false,
}: {
  concept: Showcase;
  rentalBrowse?: boolean;
}) {
  const Experience =
    s.category === "Shops / Ecommerce"
      ? ShopExperience
      : s.category === "Rental"
        ? RentalExperience
        : s.category === "Cafe / Restaurant"
          ? RestaurantExperience
          : s.category === "Spa / Wellness"
            ? SpaExperience
            : s.category === "Villa"
              ? VillaExperience
              : HotelExperience;
  return (
    <div
      className={`demo-site experience-site demo-${s.slug} ${s.serif ? "demo-serif" : "demo-sans"}`}
      style={
        {
          "--paper": s.palette[0],
          "--ink": s.palette[1],
          "--accent": s.palette[2],
        } as CSSProperties
      }
    >
      <a className="demo-skip" href="#main">
        Skip to content
      </a>
      <aside className="demo-toolbar" aria-label="DevnPixel showcase controls">
        <Link href="/showcase" className="demo-back">
          ← <span>Back to </span>Showcase
        </Link>
        <span className="demo-badge">DEVNPIXEL / CONCEPT PREVIEW</span>
        <Link href={showcaseContact(s.slug)} className="demo-enquire">
          Want a website like this? <span>Let’s talk ↗</span>
        </Link>
      </aside>
      {s.category === "Rental" ? (
        <RentalExperience s={s} browse={rentalBrowse} />
      ) : (
        <Experience s={s} />
      )}
      <section className="experience-design">
        <div>
          <p className="demo-kicker">THE DESIGN / DEVNPIXEL</p>
          <h2>{s.seo}</h2>
        </div>
        <div>
          <p>{s.design}</p>
          <p className="demo-small">
            Independent concept. Fictional brand, sample offers and illustrative
            imagery. No bookings, appointments or orders are sent.
          </p>
          <Link className="demo-text-link" href={showcaseContact(s.slug)}>
            Discuss a website like this ↗
          </Link>
        </div>
      </section>
      <section className="experience-next">
        <p className="demo-kicker">A DIFFERENT DIRECTION</p>
        <div>
          {showcases
            .filter((p) => p.slug !== s.slug)
            .slice(0, 3)
            .map((p) => (
              <Link key={p.slug} href={`/showcase/${p.slug}`}>
                <span>{p.category}</span>
                <strong>{p.name} ↗</strong>
              </Link>
            ))}
        </div>
      </section>
      <footer className="demo-footer">
        <strong>{s.name}</strong>
        <p>
          A fictional {s.location} concept by <Link href="/">DevnPixel</Link>.
          <br />
          Illustrative photography. Preview interactions only.
        </p>
        <a href="#main">Back to top ↑</a>
      </footer>
    </div>
  );
}
