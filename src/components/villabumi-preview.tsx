"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation keeps this client preview portable to its planned Vite build. */

import { useEffect, useRef, useState, type FormEvent } from "react";
import { villaBumi as villa } from "@/lib/villabumi";

const navigation = [
  ["about", "About"],
  ["rooms", "Rooms"],
  ["rates", "Rates"],
  ["location", "Location"],
  ["contact", "Contact"],
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.5 11.75a8.5 8.5 0 0 1-12.65 7.4L3 20.5l1.38-4.7A8.5 8.5 0 1 1 20.5 11.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 6.9c-.3 0-.6.1-.8.4-.5.5-.8 1.1-.8 1.8 0 1.1.7 2.3 1.9 3.7 1.5 1.7 3.4 2.8 5.1 3.1.8.1 1.6-.2 2.1-.7.3-.4.5-.9.5-1.3 0-.2-.1-.3-.3-.4l-2-1c-.2-.1-.4-.1-.5.1l-.9 1c-.1.1-.3.2-.5.1-1.5-.6-2.6-1.6-3.3-2.9-.1-.2-.1-.3 0-.5l.7-.8c.2-.2.2-.4.1-.6l-.9-2c-.1-.2-.2-.3-.5-.3Z"
        fill="currentColor"
      />
    </svg>
  );
}
function VillaPhoto({
  id,
  priority = false,
  className = "",
}: {
  id: string;
  priority?: boolean;
  className?: string;
}) {
  const photo = villa.photos.find((p) => p.id === id)!;
  // Native responsive images intentionally keep this React component portable to Vite.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Locally optimized WebP srcsets support the future Vite build without Next Image.
    <img
      className={`bumi-photo ${className}`}
      src={`/villabumi/${id}.webp`}
      srcSet={`/villabumi/${id}-720.webp 720w, /villabumi/${id}-1200.webp 1200w, /villabumi/${id}.webp 1800w`}
      sizes="(max-width: 700px) 100vw, 55vw"
      alt={photo.alt}
      width={1800}
      height={1200}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

function AreaMap() {
  return (
    <a
      className="bumi-map"
      href={villa.maps}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the Jalan Puncak Wisea area in Google Maps (new tab)"
    >
      <svg viewBox="0 0 620 410" role="img" aria-labelledby="bumi-map-title">
        <title id="bumi-map-title">
          Illustrative overview of the Bukit peninsula, not a navigation map
        </title>
        <rect width="620" height="410" fill="#d9e0d7" />
        <path
          d="M0 0h150c-20 65 22 115-24 157S94 245 54 260 18 310 0 354Z"
          fill="#b5cdca"
        />
        <g fill="#c9d4c4" opacity=".8">
          <path d="M240 20 350 0l40 106-98 24Z" />
          <path d="m440 80 100-23 55 72-96 62Z" />
          <path d="m300 270 100-45 88 95-138 65Z" />
          <path d="m110 278 80-42 90 107-100 50Z" />
        </g>
        <g
          fill="none"
          stroke="#f5f0e7"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M174 0c-8 100 114 107 119 185s-90 87-77 225" />
          <path d="M95 149c70-34 120 47 198 36s168-40 327-5" />
          <path d="M64 249c135 34 170 98 276 26s188-4 280 2" />
          <path d="M363 0c11 67 61 64 85 115s-7 126 31 168 31 65 27 127" />
        </g>
        <g fill="none" stroke="#efeae0" strokeWidth="4">
          <path d="m206 79 108-30 67 72 53-5" />
          <path d="m310 225 46-32 47 41 40-17" />
          <path d="m128 315 52-95 28-48" />
        </g>
        <g
          fill="#5c6c60"
          fontFamily="Arial,sans-serif"
          fontSize="12"
          letterSpacing="2"
        >
          <text x="385" y="347">
            PECATU
          </text>
          <text x="27" y="126" transform="rotate(-90 27 126)">
            INDIAN OCEAN
          </text>
        </g>
        <g fill="#58665b" fontFamily="Arial,sans-serif" fontSize="11">
          <circle cx="109" cy="145" r="4" />
          <text x="121" y="138">
            Bingin
          </text>
          <circle cx="72" cy="244" r="4" />
          <text x="84" y="239">
            Padang-Padang
          </text>
          <circle cx="130" cy="352" r="4" />
          <text x="142" y="349">
            Uluwatu
          </text>
        </g>
        <circle cx="328" cy="162" r="32" fill="#b2684c" opacity=".12" />
        <circle
          cx="328"
          cy="162"
          r="7"
          fill="#ae644b"
          stroke="#fff9f0"
          strokeWidth="3"
        />
        <rect x="350" y="137" width="144" height="47" rx="2" fill="#f8f5ef" />
        <text
          x="368"
          y="157"
          fontFamily="Georgia,serif"
          fill="#353a30"
          fontSize="14"
        >
          Villa Bumi area
        </text>
        <text
          x="368"
          y="173"
          fontFamily="Arial,sans-serif"
          fill="#747b70"
          fontSize="9"
        >
          Jalan Puncak Wisea
        </text>
      </svg>
      <span className="bumi-map-caption">
        <span>Area overview · illustrative</span>
        <span>
          Open Google Maps <Arrow diagonal />
        </span>
      </span>
    </a>
  );
}

export function VillaBumiPreview() {
  const siteRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState("");
  const gallery = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const root = siteRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".bumi-about-copy, .bumi-section-heading, .bumi-gallery-photo, .bumi-room, .bumi-facilities, .bumi-rates table, .bumi-rates-bottom, .bumi-location > div, .bumi-map, .bumi-contact > h2, .bumi-contact form",
      ),
    );
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("bumi-in-view");
            reveal.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    const configure = () => {
      reveal.disconnect();
      targets.forEach((element) => {
        element.classList.remove("bumi-reveal", "bumi-in-view");
        if (
          !preference.matches &&
          element.getBoundingClientRect().top > window.innerHeight
        ) {
          element.classList.add("bumi-reveal");
          reveal.observe(element);
        }
      });
    };
    configure();
    preference.addEventListener("change", configure);
    const header = root.querySelector(".bumi-header");
    const marker = root.querySelector(".bumi-preview-bar");
    const headerObserver = new IntersectionObserver(([entry]) => {
      header?.classList.toggle("bumi-header-scrolled", !entry.isIntersecting);
    });
    if (marker) headerObserver.observe(marker);
    return () => {
      reveal.disconnect();
      headerObserver.disconnect();
      preference.removeEventListener("change", configure);
      targets.forEach((element) =>
        element.classList.remove("bumi-reveal", "bumi-in-view"),
      );
    };
  }, []);
  const openPhoto = (id: string) => {
    setActivePhoto(villa.photos.findIndex((p) => p.id === id));
    gallery.current?.showModal();
  };
  const step = (direction: number) =>
    setActivePhoto(
      (n) => (n + direction + villa.photos.length) % villa.photos.length,
    );
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menuOpen]);
  function previewEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = String(data.get("arrival") || ""),
      end = String(data.get("departure") || "");
    if ((start && !end) || (!start && end)) {
      setNotice(
        "Please choose both an arrival and departure date, or leave both dates open.",
      );
      return;
    }
    if (start && end && end <= start) {
      setNotice("Please choose a departure date after your arrival.");
      return;
    }
    setNotice(
      "Your enquiry preview is ready. This design preview does not send messages or make reservations. For a real enquiry, use Villa Bumi’s email or WhatsApp link below.",
    );
  }
  return (
    <div className="bumi-site" ref={siteRef}>
      <a className="bumi-skip" href="#bumi-main">
        Skip to content
      </a>
      <div className="bumi-preview-bar">
        <a href="/showcase">← Back to Showcase</a>
        <span>VILLA BUMI / DESIGN PREVIEW</span>
        <a href="/contact?service=web-design">
          By DevnPixel <Arrow diagonal />
        </a>
      </div>
      <header className="bumi-header">
        <a
          className="bumi-wordmark"
          href="#bumi-main"
          aria-label="Villa Bumi home"
        >
          VILLA BUMI<span>PECATU · BALI</span>
        </a>
        <nav className="bumi-desktop-nav" aria-label="Villa Bumi navigation">
          {navigation.map(([id, label]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>
        <div className="bumi-header-actions">
          <a className="bumi-button bumi-button-compact" href="#contact">
            Enquire <Arrow diagonal />
          </a>
          <button
            ref={menuButton}
            className="bumi-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="bumi-mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span>{menuOpen ? "Close" : "Menu"}</span>
            <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
          </button>
        </div>
        <nav
          id="bumi-mobile-menu"
          className="bumi-mobile-nav"
          aria-label="Mobile Villa Bumi navigation"
          hidden={!menuOpen}
        >
          {navigation.map(([id, label], i) => (
            <a href={`#${id}`} key={id} onClick={() => setMenuOpen(false)}>
              <small>0{i + 1}</small>
              {label}
              <Arrow />
            </a>
          ))}
          <p>A little closer to the earth.</p>
        </nav>
      </header>
      <main id="bumi-main">
        <section className="bumi-hero" aria-labelledby="bumi-heading">
          <div className="bumi-hero-copy">
            <p className="bumi-eyebrow">{villa.location}</p>
            <h1 id="bumi-heading">
              A hillside retreat
              <br />
              above the <em>Bukit.</em>
            </h1>
            <p className="bumi-lead">{villa.intro}</p>
            <div className="bumi-hero-links">
              <a className="bumi-button" href="#contact">
                Check availability <Arrow />
              </a>
              <a className="bumi-text-link" href="#gallery">
                View gallery <span>↗</span>
              </a>
            </div>
            <div className="bumi-hero-foot">
              <span>03 bedrooms</span>
              <span>01 private escape</span>
              <a href="#about" aria-label="Discover the villa below">
                ↓
              </a>
            </div>
          </div>
          <button
            className="bumi-hero-image"
            onClick={() => openPhoto("sunset")}
            aria-label="View Villa Bumi pool terrace photograph"
          >
            <VillaPhoto id="sunset" priority />
            <span className="bumi-image-tag">
              A slower kind of Bali <span>＋</span>
            </span>
          </button>
        </section>
        <section
          id="about"
          className="bumi-about"
          aria-labelledby="bumi-about-heading"
        >
          <div className="bumi-about-photo">
            <VillaPhoto id="deck" />
            <span className="bumi-photo-caption">THE VIEW FROM HERE</span>
          </div>
          <div className="bumi-about-copy">
            <span className="bumi-rule" />
            <p className="bumi-eyebrow">A LITTLE CLOSER TO THE EARTH</p>
            <h2 id="bumi-about-heading">About the villa</h2>
            {villa.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <a className="bumi-text-link" href="#rooms">
              Find your quiet corner <Arrow diagonal />
            </a>
          </div>
        </section>
        <section
          id="gallery"
          className="bumi-section bumi-gallery"
          aria-labelledby="bumi-gallery-heading"
        >
          <div className="bumi-section-heading">
            <div>
              <p className="bumi-eyebrow">ROOM TO SLOW DOWN</p>
              <h2 id="bumi-gallery-heading">A glimpse of life here.</h2>
            </div>
            <button
              className="bumi-text-link"
              onClick={() => openPhoto("living")}
            >
              View all {villa.photos.length} photographs <Arrow diagonal />
            </button>
          </div>
          <div className="bumi-gallery-grid">
            {["living", "bedroomDetail", "garden"].map((id, i) => (
              <button
                className={`bumi-gallery-photo bumi-gallery-photo-${i}`}
                key={id}
                onClick={() => openPhoto(id)}
                aria-label={`View ${villa.photos.find((p) => p.id === id)!.title} photograph`}
              >
                <VillaPhoto id={id} />
                <span>
                  {
                    ["Open, easy living", "Quiet corners", "Naturally at home"][
                      i
                    ]
                  }
                  <span aria-hidden="true">＋</span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section
          id="rooms"
          className="bumi-section bumi-rooms"
          aria-labelledby="bumi-rooms-heading"
        >
          <div className="bumi-section-heading">
            <div>
              <p className="bumi-eyebrow">YOUR OWN CORNER OF CALM</p>
              <h2 id="bumi-rooms-heading">Three bedrooms.</h2>
            </div>
            <p>
              Space to come together.
              <br />
              Room to make your own.
            </p>
          </div>
          {villa.rooms.map((room, i) => (
            <article className="bumi-room" key={room.name}>
              <button
                className="bumi-room-photo"
                onClick={() => openPhoto(room.image)}
                aria-label={`View ${room.name.toLowerCase()} photograph`}
              >
                <VillaPhoto id={room.image} />
                <span className="bumi-room-plus" aria-hidden="true">
                  ＋
                </span>
              </button>
              <div className="bumi-room-copy">
                <span className="bumi-room-number">0{i + 1}</span>
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <p className="bumi-room-detail">{room.detail}</p>
              </div>
            </article>
          ))}
        </section>
        <section
          className="bumi-section bumi-facilities"
          aria-labelledby="bumi-facilities-heading"
        >
          <div>
            <p className="bumi-eyebrow">THE LITTLE THINGS, CONSIDERED</p>
            <h2 id="bumi-facilities-heading">Settle right in.</h2>
            <p>Everything you need for an unhurried stay.</p>
          </div>
          <ul>
            {villa.facilities.map((f) => (
              <li key={f}>
                <span aria-hidden="true">—</span>
                {f}
              </li>
            ))}
          </ul>
        </section>
        <section
          id="rates"
          className="bumi-section bumi-rates"
          aria-labelledby="bumi-rates-heading"
        >
          <div className="bumi-section-heading">
            <div>
              <p className="bumi-eyebrow">STAY A LITTLE LONGER</p>
              <h2 id="bumi-rates-heading">Rates & availability</h2>
            </div>
            <span className="bumi-rate-badge">
              THE WHOLE VILLA / MONTHLY STAYS
            </span>
          </div>
          <p>
            Make Villa Bumi your home for a while. Monthly rental rates vary
            with the season.
          </p>
          <table>
            <caption className="bumi-visually-hidden">
              Indicative monthly rates from the supplied design brief, in US
              dollars
            </caption>
            <thead>
              <tr>
                <th scope="col">Season</th>
                <th scope="col">USD / month</th>
              </tr>
            </thead>
            <tbody>
              {villa.rates.map((r) => (
                <tr key={r.season}>
                  <th scope="row">
                    {r.season}
                    <span>{r.detail}</span>
                  </th>
                  <td>{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bumi-rates-bottom">
            <div>
              <p>
                Includes Wi-Fi and regular housekeeping. Excludes electricity,
                breakfast, consumables and property water. A refundable USD
                1,000 security deposit is due at check-in for monthly stays.
              </p>
              <p className="bumi-fine">
                Indicative rates for design review, based on the supplied brief.
                Please confirm current prices, inclusions and availability
                directly with the villa.
              </p>
            </div>
            <a className="bumi-button" href="#contact">
              Enquire about rates <Arrow />
            </a>
          </div>
        </section>
        <section
          id="location"
          className="bumi-section bumi-location"
          aria-labelledby="bumi-location-heading"
        >
          <div>
            <p className="bumi-eyebrow">ON THE BUKIT PENINSULA</p>
            <h2 id="bumi-location-heading">
              Close to the coast.
              <br />
              <em>Away from the rush.</em>
            </h2>
            <p>
              Find us on Jalan Puncak Wisea in Pecatu — a quiet hillside setting
              on Bali’s Bukit peninsula, with native gardens and the coast a
              short drive away.
            </p>
            <ul>
              <li>
                <span>03 min</span>Bingin
              </li>
              <li>
                <span>05 min</span>Padang-Padang
              </li>
              <li>
                <span>08–10 min</span>Uluwatu
              </li>
            </ul>
            <p className="bumi-fine">
              Approximate driving times from the villa’s website; allow for
              local traffic.
            </p>
          </div>
          <AreaMap />
        </section>
        <section
          id="contact"
          className="bumi-section bumi-contact"
          aria-labelledby="bumi-contact-heading"
        >
          <p className="bumi-eyebrow">LET’S PLAN YOUR STAY</p>
          <h2 id="bumi-contact-heading">Get in touch.</h2>
          <p>
            Questions about the villa or a longer stay?
            <br />
            Tell us a little about your plans.
          </p>
          <form onSubmit={previewEnquiry} onChange={() => setNotice("")}>
            <div className="bumi-form-row">
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Name"
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="Email"
                />
              </label>
            </div>
            <div className="bumi-form-row">
              <label>
                Arrival <span className="bumi-optional">(optional)</span>
                <input name="arrival" type="date" />
              </label>
              <label>
                Departure <span className="bumi-optional">(optional)</span>
                <input name="departure" type="date" />
              </label>
            </div>
            <label>
              Your message
              <textarea
                name="message"
                rows={3}
                required
                maxLength={3000}
                placeholder="A little about your stay…"
              />
            </label>
            <div className="bumi-form-submit">
              <button type="submit" className="bumi-button">
                Preview enquiry <Arrow />
              </button>
              <span className="bumi-fine">
                Design preview — no message is sent.
              </span>
            </div>
            <p className="bumi-form-status" role="status">
              {notice}
            </p>
          </form>
          <div className="bumi-contact-links">
            <a href={`mailto:${villa.email}`}>{villa.email}</a>
            <a href={`tel:${villa.phone.replace(/\s/g, "")}`}>{villa.phone}</a>
            <a href={villa.instagram} target="_blank" rel="noopener noreferrer">
              @villabumibali <Arrow diagonal />
            </a>
          </div>
        </section>
      </main>
      <footer className="bumi-footer">
        <a className="bumi-wordmark" href="#bumi-main">
          VILLA BUMI
        </a>
        <p>
          © {new Date().getFullYear()} Villa Bumi. Design preview by{" "}
          <a href="/">DevnPixel</a>.
        </p>
        <a href={villa.instagram} target="_blank" rel="noopener noreferrer">
          Instagram <Arrow diagonal />
        </a>
      </footer>
      <a
        className="bumi-whatsapp"
        href={villa.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Villa Bumi on WhatsApp (new tab)"
      >
        <WhatsAppIcon />
        <span>Chat on WhatsApp</span>
      </a>
      <dialog
        ref={gallery}
        className="bumi-lightbox"
        aria-label="Villa Bumi photo gallery"
        onClick={(e) => {
          if (e.target === e.currentTarget) gallery.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        <div className="bumi-lightbox-top">
          <span>VILLA BUMI / GALLERY</span>
          <button
            onClick={() => gallery.current?.close()}
            aria-label="Close photo gallery"
          >
            Close ×
          </button>
        </div>
        <div className="bumi-lightbox-image">
          <VillaPhoto id={villa.photos[activePhoto].id} priority />
        </div>
        <div className="bumi-lightbox-bottom">
          <button onClick={() => step(-1)} aria-label="Previous photograph">
            ←
          </button>
          <div aria-live="polite">
            <p>{villa.photos[activePhoto].title}</p>
            <span>
              {String(activePhoto + 1).padStart(2, "0")} / {villa.photos.length}
            </span>
          </div>
          <button onClick={() => step(1)} aria-label="Next photograph">
            →
          </button>
        </div>
      </dialog>
    </div>
  );
}
