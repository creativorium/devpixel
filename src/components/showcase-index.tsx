"use client";
import { useState } from "react";
import { ShowcaseLocalContext } from "./showcase-local-context";
import Image from "next/image";
import Link from "next/link";
import { showcases, showcaseCategories } from "@/lib/showcase";
import { showcaseCopy } from "@/lib/showcase-copy";
import { localizedPath, type Locale } from "@/lib/i18n";
export function ShowcaseIndex({ locale = "en" }: { locale?: Locale }) {
  const [filter, setFilter] = useState("all");
  const t = showcaseCopy[locale];
  return (
    <main id="main" className="section inner-page showcase-index">
      <div className="showcase-intro">
        <p className="eyebrow">DEVNPIXEL / DESIGN EXPLORATIONS / BALI</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <Link className="text-link" href={localizedPath("/contact", locale)}>
          {t.contact} ↗
        </Link>
      </div>
      <div className="showcase-filter" aria-label={t.nav}>
        <button
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          {t.all} <span>{showcases.length}</span>
        </button>
        {showcaseCategories.map((category, i) => (
          <button
            key={category}
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
          >
            {t.categories[i]} <span>01</span>
          </button>
        ))}
      </div>
      <p className="showcase-note">{t.note}</p>
      <p className="sr-only" role="status">
        {filter === "all" ? showcases.length : 1} {t.concept}
      </p>
      <div className="showcase-grid">
        {showcases
          .filter((s) => filter === "all" || s.category === filter)
          .map((s, i) => (
            <article key={s.slug} className="showcase-card">
              <Link
                href={`/showcase/${s.slug}`}
                className={`showcase-preview preview-${s.layout}`}
                style={{ background: s.palette[0], color: s.palette[1] }}
                aria-label={`${t.explore}: ${s.name}`}
              >
                <div className="showcase-browser" aria-hidden="true">
                  <span>● ● ●</span>
                  <span>{s.name}</span>
                  <span>↗</span>
                </div>
                <Image
                  className="showcase-live-preview"
                  src={`/showcase/previews/${s.slug}.jpg`}
                  alt={`${s.name}: preview of the ${s.category.toLowerCase()} website`}
                  width={1440}
                  height={1100}
                  sizes="(max-width:760px) 100vw, 50vw"
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </Link>
              <div className="showcase-caption">
                <div>
                  <h3>
                    <Link href={`/showcase/${s.slug}`}>{s.name}</Link>
                  </h3>
                  <p>
                    {t.categories[showcaseCategories.indexOf(s.category)]} /{" "}
                    {s.style}
                  </p>
                </div>
                <Link
                  href={`/showcase/${s.slug}`}
                  aria-label={`${t.explore}: ${s.name}`}
                >
                  ↗
                </Link>
              </div>
            </article>
          ))}
      </div>
      <ShowcaseLocalContext locale={locale} />
      <div className="showcase-bottom">
        <p className="eyebrow">FROM A DIRECTION TO YOUR BRAND</p>
        <h2>{t.contact}</h2>
        <p>{t.intro}</p>
        <Link
          className="button dark"
          href={localizedPath("/contact?service=web-design", locale)}
        >
          {t.contact} ↗
        </Link>
      </div>
    </main>
  );
}
