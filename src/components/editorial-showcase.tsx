"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Fragment,
  useSyncExternalStore,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  FurnitureCategories,
  FurnitureMaterials,
  FurnitureDelivery,
  VillaSpaceGuide,
  VillaStayDetails,
} from "./showcase-specialists";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { showcaseContact, type Showcase } from "@/lib/showcase";

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}
function LetterHeading({
  text,
  hero = false,
}: {
  text: string;
  hero?: boolean;
}) {
  const Tag = hero ? "h1" : "h2";
  return (
    <Tag data-letters aria-label={text}>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="rd-word" aria-hidden="true">
            {Array.from(word).map((letter, j) => (
              <span className="rd-letter" key={j}>
                {letter}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
function Photo({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      className={`rd-photo ${className}`}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 700px) 100vw, 70vw"
      priority={priority}
    />
  );
}
const furniture = [
  {
    id: "chair",
    name: "The Sunday chair",
    type: "Seating",
    price: 2450000,
    material: "Oak frame · linen upholstery",
    size: "76 × 82 × 80 cm",
    photo: "interior",
    position: "10% 80%",
  },
  {
    id: "table",
    name: "Gather coffee table",
    type: "Tables",
    price: 1850000,
    material: "Solid oak · natural oil finish",
    size: "90 × 90 × 38 cm",
    photo: "interior",
    position: "52% 85%",
  },
  {
    id: "sofa",
    name: "Slow living sofa",
    type: "Seating",
    price: 7900000,
    material: "Timber frame · warm leather",
    size: "220 × 92 × 80 cm",
    photo: "interior",
    position: "95% 75%",
  },
  {
    id: "lamp",
    name: "Quiet corner lamp",
    type: "Lighting",
    price: 980000,
    material: "Ceramic base · woven shade",
    size: "32 × 32 × 54 cm",
    photo: "interior",
    position: "33% 46%",
  },
];
type Piece = (typeof furniture)[number];
const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function EditorialShowcase({ concept }: { concept: Showcase }) {
  const root = useRef<HTMLDivElement>(null);
  const villa = concept.slug === "sora-uluwatu-villa";
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        root.current
          ?.querySelectorAll<HTMLElement>("[data-letters]")
          .forEach((heading) => {
            gsap.from(heading.querySelectorAll(".rd-letter"), {
              yPercent: 95,
              opacity: 0,
              duration: 0.8,
              stagger: 0.018,
              ease: "power3.out",
              scrollTrigger: { trigger: heading, start: "top 94%", once: true },
            });
          });
        root.current
          ?.querySelectorAll<HTMLElement>("[data-reveal]")
          .forEach((element) => {
            gsap.from(element, {
              y: 25,
              opacity: 0,
              duration: 0.85,
              ease: "power2.out",
              scrollTrigger: { trigger: element, start: "top 92%", once: true },
            });
          });
        gsap.from(".rd-hero-image", {
          scale: 1.045,
          duration: 1.8,
          ease: "power2.out",
        });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [villa]);
  return (
    <div ref={root} className={`rd-site ${villa ? "rd-sora" : "rd-nativ"}`}>
      <a className="rd-skip" href="#main">
        Skip to content
      </a>
      <aside className="rd-studio">
        <Link href="/showcase">← All showcases</Link>
        <span>DEVNPIXEL / INDEPENDENT CONCEPT</span>
        <Link href={showcaseContact(concept.slug)}>
          Make it yours <Arrow />
        </Link>
      </aside>
      {villa ? <VillaDesign /> : <FurnitureDesign />}
      <section className="rd-design-note">
        <div>
          <span className="rd-eyebrow">BEHIND THE DESIGN</span>
          <h2>{concept.seo}</h2>
        </div>
        <div>
          <p>{concept.design}</p>
          <p className="rd-disclosure">
            Fictional brand and illustrative imagery. Products, prices and stays
            are samples. No orders or reservations are submitted.
          </p>
          <Link className="rd-text-link" href={showcaseContact(concept.slug)}>
            Discuss your website <Arrow />
          </Link>
        </div>
      </section>
      <footer className="rd-footer">
        <Link href="/">DevnPixel</Link>
        <span>
          {villa ? "SORA / A PRIVATE HORIZON" : "NATIV / OBJECTS TO LIVE WITH"}
        </span>
        <a href="#main">Back to top ↑</a>
      </footer>
    </div>
  );
}

function FurnitureDesign() {
  const [category, setCategory] = useState("All pieces");
  const [selected, setSelected] = useState<Piece | null>(null);
  const [bag, setBag] = useState<Piece[]>([]);
  const productDialog = useRef<HTMLDialogElement>(null);
  const bagDialog = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState("");
  return (
    <>
      <header className="rd-nav">
        <a className="rd-brand" href="#main">
          NATIV<span>FURNITURE & OBJECTS</span>
        </a>
        <nav aria-label="Furniture navigation">
          <a href="#collection">Collection</a>
          <a href="#materials">Materials</a>
          <a href="#spaces">Delivery & care</a>
        </nav>
        <button
          className="rd-pill"
          onClick={() => {
            setNotice("");
            bagDialog.current?.showModal();
          }}
        >
          Bag <span>({bag.length})</span>
        </button>
      </header>
      <main id="main">
        <section className="rd-furniture-hero">
          <Photo
            className="rd-hero-image"
            src="/showcase/interior.jpg"
            alt="Sunlit living room with warm timber furniture, a leather sofa and linen chairs"
            priority
          />
          <div className="rd-furniture-hero-copy">
            <span className="rd-eyebrow">LESS, BUT MORE CONSIDERED.</span>
            <LetterHeading hero text="Room for the everyday." />
            <p>
              Thoughtful furniture. Natural materials.
              <br />
              For all the little moments that make a home.
            </p>
            <a className="rd-pill rd-dark" href="#collection">
              Explore the collection <Arrow />
            </a>
          </div>
          <div className="rd-hero-caption">
            <span>THE SLOW LIVING COLLECTION</span>
            <span>01 / A place to come back to</span>
          </div>
        </section>
        <FurnitureCategories choose={setCategory} />
        <section className="rd-section" id="collection">
          <div className="rd-section-heading">
            <div>
              <span className="rd-eyebrow">A FEW GOOD PIECES</span>
              <LetterHeading text="Find your everyday favourite." />
            </div>
            <span className="rd-small">SAMPLE COLLECTION / 04 PIECES</span>
          </div>
          <div className="rd-filters" aria-label="Filter furniture">
            {["All pieces", "Seating", "Tables", "Lighting"].map((type) => (
              <button
                key={type}
                aria-pressed={category === type}
                onClick={() => setCategory(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="rd-products">
            {furniture
              .filter(
                (piece) => category === "All pieces" || piece.type === category,
              )
              .map((piece) => (
                <article key={piece.id}>
                  <button
                    className="rd-product-photo"
                    aria-label={`View ${piece.name}`}
                    onClick={() => {
                      setSelected(piece);
                      productDialog.current?.showModal();
                    }}
                  >
                    <Image
                      src={`/showcase/${piece.photo}.jpg`}
                      alt={piece.name + " — illustrative room detail"}
                      fill
                      sizes="(max-width:600px) 100vw, 25vw"
                      style={{ objectPosition: piece.position }}
                    />
                    <span className="rd-circle">
                      <Arrow />
                    </span>
                  </button>
                  <div className="rd-product-title">
                    <h3>{piece.name}</h3>
                    <span>{rupiah(piece.price)}</span>
                  </div>
                  <p className="rd-small">{piece.material}</p>
                </article>
              ))}
          </div>
          <p className="rd-small rd-sample-note" role="status">
            {
              furniture.filter(
                (piece) => category === "All pieces" || piece.type === category,
              ).length
            }{" "}
            sample pieces · Illustrative room photography
          </p>
        </section>
        <FurnitureMaterials />
        <FurnitureDelivery />
      </main>
      <dialog
        className="rd-dialog"
        aria-label="Product details"
        ref={productDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            productDialog.current?.close();
        }}
      >
        <button
          className="rd-dialog-close"
          aria-label="Close product details"
          onClick={() => productDialog.current?.close()}
        >
          ×
        </button>
        {selected && (
          <>
            <span className="rd-eyebrow">THE SAMPLE COLLECTION</span>
            <h2>{selected.name}</h2>
            <p>{selected.material}</p>
            <p>Illustrative dimensions: {selected.size}</p>
            <strong>{rupiah(selected.price)}</strong>
            <p className="rd-small">
              A design concept, not a purchasable product.
            </p>
            <button
              className="rd-pill rd-dark"
              onClick={() => {
                setBag((items) => [...items, selected]);
                productDialog.current?.close();
              }}
            >
              Add to sample bag <Arrow />
            </button>
          </>
        )}
      </dialog>
      <dialog
        className="rd-dialog"
        aria-label="Sample shopping bag"
        ref={bagDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) bagDialog.current?.close();
        }}
      >
        <button
          className="rd-dialog-close"
          aria-label="Close bag"
          onClick={() => bagDialog.current?.close()}
        >
          ×
        </button>
        <span className="rd-eyebrow">YOUR EDIT</span>
        <h2>The sample bag.</h2>
        {bag.length ? (
          <ul className="rd-bag-items">
            {bag.map((piece, i) => (
              <li key={`${piece.id}-${i}`}>
                <div>
                  <strong>{piece.name}</strong>
                  <span>{rupiah(piece.price)}</span>
                </div>
                <button
                  aria-label={`Remove ${piece.name}`}
                  onClick={() =>
                    setBag((items) => items.filter((_, index) => i !== index))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Your bag is taking a little breather. Explore the collection to add
            a piece.
          </p>
        )}
        <p>
          Total{" "}
          <strong>
            {rupiah(bag.reduce((sum, piece) => sum + piece.price, 0))}
          </strong>
        </p>
        <button
          className="rd-pill rd-dark"
          disabled={!bag.length}
          onClick={() =>
            setNotice(
              "This is a sample bag. No order was placed and no payment was taken.",
            )
          }
        >
          Preview checkout <Arrow />
        </button>
        <p className="rd-small" role="status">
          {notice || "Preview only. No payments or orders."}
        </p>
      </dialog>
    </>
  );
}

const currentDay = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });
const serverDay = () => "";
function subscribeDay(update: () => void) {
  window.addEventListener("focus", update);
  return () => window.removeEventListener("focus", update);
}
function VillaDesign() {
  const [rooms, setRooms] = useState("2");
  const [notice, setNotice] = useState("");
  const today = useSyncExternalStore(subscribeDay, currentDay, serverDay);
  return (
    <>
      <main id="main">
        <section className="rd-villa-hero">
          <Photo
            className="rd-hero-image"
            src="/showcase/sora-hero.webp"
            alt="Illustrative contemporary coastal villa at dusk with warm interiors and an infinity pool"
            priority
          />
          <div className="rd-villa-shade" />
          <header className="rd-nav">
            <a className="rd-brand" href="#main">
              SORA<span>A PRIVATE HORIZON</span>
            </a>
            <nav aria-label="Villa navigation">
              <a href="#villa">The villa</a>
              <a href="#stays">Ways to stay</a>
              <a href="#guest-info">Guest info</a>
            </nav>
            <a className="rd-pill" href="#enquire">
              Plan your stay <Arrow />
            </a>
          </header>
          <div className="rd-villa-wordmark" aria-hidden="true">
            SORA.
          </div>
          <div className="rd-villa-hero-copy">
            <span className="rd-eyebrow">ULUWATU, BALI / 08° SOUTH</span>
            <LetterHeading hero text="Somewhere above the everyday." />
            <p>
              Open horizons. Quiet architecture.
              <br />A place to be, together.
            </p>
            <a className="rd-pill" href="#villa">
              Discover your escape <Arrow />
            </a>
          </div>
          <div className="rd-villa-features">
            {[
              ["01", "One private place", "Room to gather, space to retreat."],
              [
                "02",
                "An open horizon",
                "A poolside afternoon, entirely yours.",
              ],
              ["03", "A slower rhythm", "Wake up with nowhere to rush."],
              ["04", "A thoughtful stay", "The little details, considered."],
            ].map(([number, title, copy]) => (
              <a href="#villa" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <i>
                  <Arrow />
                </i>
              </a>
            ))}
          </div>
        </section>
        <VillaSpaceGuide />
        <VillaStayDetails rooms={rooms} choose={setRooms} />
        <section className="rd-villa-enquire" id="enquire">
          <div>
            <span className="rd-eyebrow">YOUR NEXT CHAPTER</span>
            <LetterHeading text="Meet you at the horizon." />
            <p>A few details are all it takes to imagine a stay.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const start = String(data.get("arrival")),
                end = String(data.get("departure"));
              setNotice(
                end <= start
                  ? "Choose a departure date after your arrival."
                  : "Your sample stay is ready to imagine. This concept does not send enquiries or reserve dates.",
              );
            }}
            onChange={() => setNotice("")}
          >
            <p className="rd-selected-stay">Planning for {rooms === "2" ? "4" : "6"} guests · {rooms} bedrooms</p>
            <input type="hidden" name="bedrooms" value={rooms} />
            <label>
              Your name
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="Name"
                maxLength={100}
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
              />
            </label>
            <label>
              Arrival
              <input required type="date" min={today} name="arrival" />
            </label>
            <label>
              Departure
              <input required type="date" min={today} name="departure" />
            </label>
            <label className="rd-enquiry-message">
              Anything on your mind?
              <textarea
                name="message"
                rows={2}
                maxLength={2000}
                placeholder="A little about your plans…"
              />
            </label>
            <div className="rd-enquiry-action">
              <button className="rd-pill" type="submit">
                Preview your stay <Arrow />
              </button>
              <span>Concept preview / no reservation</span>
            </div>
            <p className="rd-enquiry-notice" role="status">
              {notice}
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
