"use client";
import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Showcase } from "@/lib/showcase";

type Props = { s: Showcase };
const money = (n: number) =>
  new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const subscribe = () => () => {};
const dateNow = () => new Date().toLocaleDateString("en-CA");
const emptyDate = () => "";
function useToday() {
  return useSyncExternalStore(subscribe, dateNow, emptyDate);
}
function Photo({
  name,
  alt,
  className = "",
  eager = false,
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div className={`exp-photo ${className}`}>
      <Image
        src={`/showcase/${name}.jpg`}
        alt={alt}
        fill
        sizes="(max-width:700px) 100vw, 60vw"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
    </div>
  );
}
function Header({
  s,
  links,
  action,
}: {
  s: Showcase;
  links: [string, string][];
  action?: ReactNode;
}) {
  return (
    <header className="exp-header">
      <a className="exp-brand" href="#main">
        {s.name}
      </a>
      <nav aria-label={`${s.name} navigation`}>
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>
      {action}
    </header>
  );
}
function Dates({
  start,
  end,
  onStart,
  onEnd,
}: {
  start: string;
  end: string;
  onStart: (s: string) => void;
  onEnd: (s: string) => void;
}) {
  const today = useToday();
  return (
    <div className="exp-dates">
      <label>
        Start date
        <input
          type="date"
          min={today}
          required
          value={start}
          onChange={(e) => onStart(e.target.value)}
        />
      </label>
      <label>
        End date
        <input
          type="date"
          min={start || today}
          required
          value={end}
          onChange={(e) => onEnd(e.target.value)}
        />
      </label>
    </div>
  );
}
function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const n = (Date.parse(end) - Date.parse(start)) / 86400000;
  return Number.isFinite(n) && n > 0 ? n : 0;
}
const previewNotice = "Preview only. Nothing has been booked or sent.";

export function ShopExperience({ s }: Props) {
  const [filter, setFilter] = useState("All objects"),
    [sort, setSort] = useState("Featured"),
    [search, setSearch] = useState("");
  const [colours, setColours] = useState(["Sand", "Sand", "Sand"]),
    [bag, setBag] = useState<Record<string, number>>({}),
    [active, setActive] = useState<number | null>(null),
    [notice, setNotice] = useState("");
  const cart = useRef<HTMLDialogElement>(null),
    details = useRef<HTMLDialogElement>(null);
  const count = Object.values(bag).reduce((a, b) => a + b, 0);
  const total = Object.entries(bag).reduce(
    (sum, [key, qty]) => sum + s.items[Number(key.split(":")[0])][2] * qty,
    0,
  );
  const categories = ["Vessels", "Tableware", "Tableware"];
  const indices = [0, 1, 2]
    .filter(
      (i) =>
        (filter === "All objects" || categories[i] === filter) &&
        s.items[i][0].toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "Price: low to high"
        ? s.items[a][2] - s.items[b][2]
        : sort === "Price: high to low"
          ? s.items[b][2] - s.items[a][2]
          : a - b,
    );
  const add = (i: number) => {
    const key = `${i}:${colours[i]}`;
    setBag((v) => ({ ...v, [key]: Math.min(10, (v[key] || 0) + 1) }));
    setNotice(`${s.items[i][0]} / ${colours[i]} added to your bag.`);
  };
  const object = (i: number) => (
    <div
      className={`store-object visual-${i} ${colours[i] === "Charcoal" ? "object-dark" : ""}`}
    >
      <div className="demo-object object-ceramics" aria-hidden="true">
        <i />
      </div>
    </div>
  );
  return (
    <>
      <div className="store-announcement">
        OBJECTS TO LIVE WITH / THE EVERYDAY COLLECTION
      </div>
      <Header
        s={s}
        links={[
          ["collection", "Shop all"],
          ["story", "Our philosophy"],
        ]}
        action={
          <button
            className="store-bag-button"
            onClick={() => cart.current?.showModal()}
          >
            Bag ({count}) ↗
          </button>
        }
      />
      <main id="main" className="store-main">
        <section className="store-hero">
          <div>
            <p className="demo-kicker">NEW / EVERYDAY OBJECTS</p>
            <h1>
              Less, but
              <br />
              <em>better.</em>
            </h1>
            <p>{s.intro}</p>
            <a href="#collection" className="store-cta">
              Shop the collection →
            </a>
          </div>
          <Photo
            name="ceramics"
            alt="Illustrative ceramic tableware collection"
            eager
          />
          <span className="store-season">01 — THE CONSIDERED HOME</span>
        </section>
        <section id="collection" className="store-catalog">
          <div className="store-heading">
            <h2>The everyday edit.</h2>
            <span>{indices.length} objects</span>
          </div>
          <div className="store-tools">
            <div className="exp-tabs" aria-label="Product categories">
              {["All objects", "Vessels", "Tableware"].map((x) => (
                <button
                  key={x}
                  aria-pressed={x === filter}
                  onClick={() => setFilter(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <label className="store-search">
              Find an object
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collection"
              />
            </label>
            <label>
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Featured</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
            </label>
          </div>
          <div className="store-grid">
            {indices.map((i) => (
              <article className="store-product" key={i}>
                <button
                  className="store-quick-view"
                  aria-label={`View ${s.items[i][0]}`}
                  onClick={() => {
                    setActive(i);
                    details.current?.showModal();
                  }}
                >
                  {object(i)}
                  <span>Quick view +</span>
                </button>
                <div className="store-product-title">
                  <h3>{s.items[i][0]}</h3>
                  <span>{money(s.items[i][2])}</span>
                </div>
                <p>
                  {categories[i]} / {colours[i]}
                </p>
                <div className="store-product-bottom">
                  <div
                    className="store-swatches"
                    aria-label={`Finish for ${s.items[i][0]}`}
                  >
                    {["Sand", "Charcoal"].map((c) => (
                      <button
                        key={c}
                        className={`swatch swatch-${c.toLowerCase()}`}
                        aria-label={`${c} finish for ${s.items[i][0]}`}
                        aria-pressed={colours[i] === c}
                        onClick={() =>
                          setColours((v) =>
                            v.map((old, n) => (n === i ? c : old)),
                          )
                        }
                      />
                    ))}
                  </div>
                  <button className="store-add" onClick={() => add(i)}>
                    Add to bag +
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!indices.length && (
            <p>No objects match. Try another search or category.</p>
          )}
          <p role="status" className="store-status">
            {notice}
          </p>
        </section>
        <section id="story" className="store-story">
          <Photo
            name="interior"
            alt="Illustrative calm living space with homeware"
          />
          <div>
            <p className="demo-kicker">FEWER THINGS. MORE MEANING.</p>
            <h2>
              A home is made
              <br />
              of small things.
            </h2>
            <p>{s.story}</p>
            <a href="#collection" className="store-cta">
              Find your everyday object →
            </a>
          </div>
        </section>
      </main>
      <dialog
        ref={details}
        className="store-detail"
        aria-label="Product details"
      >
        <button className="exp-close" onClick={() => details.current?.close()}>
          Close ×
        </button>
        {active !== null && (
          <div className="store-detail-grid">
            {object(active)}
            <div>
              <p className="demo-kicker">NATIV / CONCEPT COLLECTION</p>
              <h2>{s.items[active][0]}</h2>
              <p>{s.items[active][1]}</p>
              <strong>{money(s.items[active][2])}</strong>
              <p>Selected finish: {colours[active]}</p>
              <p className="demo-small">
                Sample product illustration. Actual dimensions, materials, stock
                and delivery are supplied by the real store.
              </p>
              <button
                className="store-cta"
                onClick={() => {
                  add(active);
                  details.current?.close();
                  cart.current?.showModal();
                }}
              >
                Add to bag →
              </button>
            </div>
          </div>
        )}
      </dialog>
      <dialog ref={cart} className="store-drawer" aria-label="Shopping bag">
        <div className="store-drawer-head">
          <h2>Your bag ({count})</h2>
          <button
            onClick={() => cart.current?.close()}
            aria-label="Close shopping bag"
          >
            ×
          </button>
        </div>
        {!count ? (
          <p>Your bag is waiting for something good.</p>
        ) : (
          Object.entries(bag)
            .filter(([, qty]) => qty > 0)
            .map(([key, qty]) => {
              const [id, finish] = key.split(":"),
                i = Number(id);
              return (
                <div key={key} className="store-cart-line">
                  <div>
                    <strong>{s.items[i][0]}</strong>
                    <p>
                      {finish} / {money(s.items[i][2])}
                    </p>
                  </div>
                  <div className="demo-quantity">
                    <button
                      aria-label={`Remove one ${s.items[i][0]} ${finish}`}
                      onClick={() => setBag((v) => ({ ...v, [key]: qty - 1 }))}
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      disabled={qty >= 10}
                      aria-label={`Add one ${s.items[i][0]} ${finish}`}
                      onClick={() => setBag((v) => ({ ...v, [key]: qty + 1 }))}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
        )}
        <div className="store-subtotal">
          <span>Sample subtotal</span>
          <strong>{money(total)}</strong>
        </div>
        <p className="demo-small">
          Shipping and tax are not calculated. This is a shopping preview.
        </p>
        <button
          className="store-cta"
          disabled={!count}
          onClick={() =>
            setNotice(
              "Checkout preview complete. No order or payment has been created.",
            )
          }
        >
          Preview checkout →
        </button>
        <p role="status">{notice}</p>
        <button
          className="exp-text-button"
          onClick={() => cart.current?.close()}
        >
          Continue shopping
        </button>
      </dialog>
    </>
  );
}

function Bike({ variant = 0 }: { variant?: number }) {
  return (
    <svg
      className={`bike-illustration bike-${variant}`}
      viewBox="0 0 420 220"
      role="img"
      aria-label="Illustrated sample scooter"
    >
      <ellipse cx="211" cy="194" rx="174" ry="12" fill="#000" opacity=".08" />
      <g fill="#252b29" stroke="#fff" strokeWidth="3">
        <circle cx="98" cy="167" r="37" />
        <circle cx="328" cy="167" r="37" />
      </g>
      <g fill="#abb6ae" stroke="#525f57" strokeWidth="7">
        <circle cx="98" cy="167" r="17" />
        <circle cx="328" cy="167" r="17" />
      </g>
      <path
        d="M91 151 Q90 104 139 103 L195 107 L213 147 L268 146 L287 65 L312 57 L331 133 L349 146 L333 155 L292 149 L286 171 L162 172 Q150 126 91 151"
        fill="currentColor"
        stroke="#233e30"
        strokeWidth="4"
      />
      <path
        d="M105 109 Q110 92 139 92 L188 92 Q205 95 208 112Z"
        fill="#303b32"
      />
      <path
        d="M300 67 L290 40 L272 38"
        fill="none"
        stroke="#303b32"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M282 37 L277 17 L260 13"
        fill="none"
        stroke="#303b32"
        strokeWidth="4"
      />
      <ellipse cx="257" cy="13" rx="14" ry="7" fill="#303b32" />
      <path d="M308 64 L323 65 L325 82 L313 87Z" fill="#fff8d8" />
      <path
        d="M220 153 H272 M150 124 L170 153"
        stroke="#233e30"
        strokeWidth="5"
        fill="none"
      />
      {variant === 1 && (
        <path d="M93 91 L83 67 L136 67 L148 91Z" fill="#34483d" />
      )}
      {variant === 2 && (
        <path
          d="M172 127 L156 147 L169 146 L160 162 L183 138 L169 140Z"
          fill="#edf6ac"
        />
      )}
    </svg>
  );
}
const selectedBikeFromUrl = () => {
  const value = Number(new URLSearchParams(window.location.search).get("bike"));
  return [0, 1, 2].includes(value) ? value : 0;
};
const defaultBike = () => 0;
export function RentalExperience({
  s,
  browse = false,
}: Props & { browse?: boolean }) {
  const initialBike = useSyncExternalStore(
    subscribe,
    selectedBikeFromUrl,
    defaultBike,
  );
  const [chosenBike, setSelected] = useState<number | null>(null),
    [filter, setFilter] = useState("All bikes"),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [delivery, setDelivery] = useState("Collect in Canggu"),
    [helmet, setHelmet] = useState(false),
    [notice, setNotice] = useState("");
  const selected = chosenBike ?? initialBike;
  const days = daysBetween(start, end),
    extras = delivery === "Deliver to accommodation" ? 75000 : 0,
    total = days * s.items[selected][2] + extras + (helmet ? 25000 * days : 0);
  const specs = [
    ["125 cc", "Automatic", "Compact"],
    ["155 cc", "Automatic", "Extra storage"],
    ["Electric", "Automatic", "Charging plan"],
  ];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!days) {
      setNotice("Choose a return date after pickup.");
      return;
    }
    setNotice(
      `${s.items[selected][0]} · ${days} day${days === 1 ? "" : "s"} · ${money(total)} sample estimate. ${previewNotice}`,
    );
  };
  return (
    <>
      <Header
        s={s}
        links={[["story", "How it works"]]}
        action={
          <Link
            href={
              browse ? `/showcase/${s.slug}` : `/showcase/${s.slug}/rentals`
            }
            className="rental-nav-cta"
          >
            {browse ? "← Rental home" : "Browse bikes ↗"}
          </Link>
        }
      />
      <main id="main" className="rental-main">
        {!browse && (
          <>
            <section className="rental-home-hero">
              <div>
                <p className="demo-kicker">CANGGU, BALI / MAKE A DAY OF IT</p>
                <h1>
                  Your island.
                  <br />
                  Your own pace.
                </h1>
                <p>
                  From a morning coffee to a sunset stop. Find a ride that fits
                  the way you want to explore.
                </p>
                <Link
                  href={`/showcase/${s.slug}/rentals`}
                  className="rental-nav-cta"
                >
                  Find your bike →
                </Link>
                <span className="rental-home-note">
                  3 sample models · Flexible dates · Pickup or delivery
                </span>
              </div>
              <Photo name="coast" alt="Illustrative island coastline" eager />
              <span className="rental-home-badge">
                GOOD DAYS
                <br />
                START HERE ↗
              </span>
            </section>
            <section className="rental-home-fleet">
              <div>
                <p className="demo-kicker">A RIDE FOR YOUR KIND OF DAY</p>
                <h2>
                  Small plans.
                  <br />
                  Big possibilities.
                </h2>
                <p>
                  City runaround, a little extra comfort, or an electric option.
                  Compare the sample fleet, then build your rental.
                </p>
              </div>
              <div className="rental-home-models">
                {s.items.map(([name, , rate], i) => (
                  <Link
                    href={`/showcase/${s.slug}/rentals?bike=${i}`}
                    key={name}
                  >
                    <Bike variant={i} />
                    <h3>{name}</h3>
                    <p>
                      From {money(rate)} / day <span>Choose →</span>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
        {browse && (
          <>
            <section className="rental-intro">
              <div>
                <p className="demo-kicker">
                  CANGGU, BALI / TWO WHEELS, MORE POSSIBILITIES
                </p>
                <h1>
                  Pick your ride.
                  <br />
                  Find your freedom.
                </h1>
                <p>{s.intro}</p>
              </div>
              <div className="rental-stamp">
                <span>LET’S</span>
                <strong>GO ↗</strong>
                <span>YOUR NEXT ISLAND DAY</span>
              </div>
            </section>
            <section id="collection" className="rental-workspace">
              <div className="rental-fleet">
                <div className="rental-section-label">
                  <h2>01 / Choose your bike</h2>
                  <span>3 sample models</span>
                </div>
                <div className="exp-tabs" aria-label="Bike types">
                  {["All bikes", "Petrol", "Electric"].map((f) => (
                    <button
                      key={f}
                      aria-pressed={filter === f}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="rental-bike-grid">
                  {s.items.map(
                    ([name, , rate], i) =>
                      (filter === "All bikes" ||
                        (filter === "Electric" ? i === 2 : i < 2)) && (
                        <button
                          className={`rental-bike-card ${selected === i ? "selected" : ""}`}
                          key={name}
                          aria-pressed={selected === i}
                          onClick={() => {
                            setSelected(i);
                            setNotice("");
                          }}
                        >
                          <div className="rental-card-top">
                            <span>
                              0{i + 1} / {i === 2 ? "ELECTRIC" : "PETROL"}
                            </span>
                            <span>
                              {selected === i ? "Selected ✓" : "Select +"}
                            </span>
                          </div>
                          <Bike variant={i} />
                          <h3>{name}</h3>
                          <div className="rental-specs">
                            {specs[i].map((x) => (
                              <span key={x}>{x}</span>
                            ))}
                          </div>
                          <strong>
                            {money(rate)} <small>/ day</small>
                          </strong>
                        </button>
                      ),
                  )}
                </div>
                <p className="demo-small">
                  Illustrated sample vehicles. Confirm the actual model, licence
                  requirements, insurance and deposit with the real operator.
                </p>
              </div>
              <aside id="request" className="rental-booking">
                <form onSubmit={submit}>
                  <p className="demo-kicker">02 / MAKE IT YOURS</p>
                  <h2>Your island ride.</h2>
                  <div className="rental-selection">
                    <Bike variant={selected} />
                    <strong>{s.items[selected][0]}</strong>
                  </div>
                  <Dates
                    start={start}
                    end={end}
                    onStart={(v) => {
                      setStart(v);
                      setNotice("");
                    }}
                    onEnd={(v) => {
                      setEnd(v);
                      setNotice("");
                    }}
                  />
                  <label>
                    Pickup method
                    <select
                      value={delivery}
                      onChange={(e) => {
                        setDelivery(e.target.value);
                        setNotice("");
                      }}
                    >
                      <option>Collect in Canggu</option>
                      <option>Deliver to accommodation</option>
                    </select>
                  </label>
                  <label className="exp-check">
                    <input
                      type="checkbox"
                      checked={helmet}
                      onChange={(e) => {
                        setHelmet(e.target.checked);
                        setNotice("");
                      }}
                    />
                    Extra helmet · {money(25000)}/day
                  </label>
                  <dl className="rental-totals">
                    <div>
                      <dt>Rental duration</dt>
                      <dd>{days ? `${days} days` : "Choose dates"}</dd>
                    </div>
                    <div>
                      <dt>Delivery</dt>
                      <dd>{money(extras)}</dd>
                    </div>
                    <div>
                      <dt>Sample estimate</dt>
                      <dd>{days ? money(total) : "—"}</dd>
                    </div>
                  </dl>
                  <button className="rental-submit" type="submit">
                    Preview booking →
                  </button>
                  <p role="status">{notice}</p>
                  <p className="demo-small">
                    No payment. No live availability check. Dates are for
                    exploring this design.
                  </p>
                </form>
              </aside>
            </section>
          </>
        )}
        <section id="story" className="rental-how">
          <h2>
            Less admin.
            <br />
            More island.
          </h2>
          {[
            [
              "01",
              "Find your fit",
              "Compare the bike type and practical details.",
            ],
            [
              "02",
              "Make a plan",
              "Choose your dates, pickup and optional extras.",
            ],
            [
              "03",
              "Confirm & go",
              "A real operator confirms availability and rental terms.",
            ],
          ].map(([n, h, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export function RestaurantExperience({ s }: Props) {
  const [tab, setTab] = useState("Dinner"),
    [notice, setNotice] = useState("");
  const today = useToday();
  const menus: Record<string, [string, string, number][]> = {
    Dinner: s.items,
    Drinks: [
      ["Tamarind spritz", "Tamarind, citrus, soda. Alcohol-free.", 65000],
      [
        "Smoked pineapple",
        "Pineapple, lime, a touch of smoke. Alcohol-free.",
        70000,
      ],
      ["Cold brew", "Slow-steeped coffee, over ice.", 45000],
    ],
    Dessert: [
      ["Dark chocolate finish", "Chocolate, sea salt and cream.", 75000],
      ["Coconut & mango", "Seasonal fruit, coconut sorbet.", 65000],
      [
        "Charred banana",
        "Caramelised banana, vanilla and toasted coconut.",
        70000,
      ],
    ],
  };
  return (
    <>
      <Header
        s={s}
        links={[
          ["collection", "The menu"],
          ["story", "The room"],
        ]}
        action={
          <a href="#request" className="restaurant-reserve">
            Reserve a table ↗
          </a>
        }
      />
      <main id="main" className="restaurant-main">
        <section className="restaurant-hero">
          <div className="restaurant-title">
            <p className="demo-kicker">
              SEMINYAK / FIRE-LED KITCHEN & GOOD COMPANY
            </p>
            <h1>
              A little fire.
              <br />
              <em>A long evening.</em>
            </h1>
          </div>
          <Photo
            name="dining"
            alt="Illustrative warm restaurant interior"
            eager
          />
          <div className="restaurant-hero-bottom">
            <p>{s.intro}</p>
            <a href="#collection">Tonight’s menu ↓</a>
            <span>
              DINNER, SLOWLY.
              <br />
              CONCEPT OPENING HOURS: 17:00–23:00
            </span>
          </div>
        </section>
        <section id="collection" className="restaurant-menu">
          <div className="restaurant-menu-heading">
            <p className="demo-kicker">FROM THE KITCHEN</p>
            <h2>For the table.</h2>
            <p>
              Start with something small.
              <br />
              Stay for one more plate.
            </p>
            <div className="exp-tabs" aria-label="Menu sections">
              {Object.keys(menus).map((t) => (
                <button
                  key={t}
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="demo-small">
              Sample menu. Allergen information and availability must be
              confirmed with a real venue.
            </p>
          </div>
          <div className="restaurant-menu-paper">
            <p className="restaurant-menu-date">
              EMBER / {tab.toUpperCase()} / SAMPLE MENU
            </p>
            {menus[tab].map(([name, desc, price]) => (
              <article key={name}>
                <div>
                  <h3>{name}</h3>
                  <p>{desc}</p>
                </div>
                <strong>{money(price)}</strong>
              </article>
            ))}
            <div className="restaurant-menu-signature">Made for sharing.</div>
          </div>
        </section>
        <section id="story" className="restaurant-vibe">
          <Photo
            name="food"
            alt="Illustrative seasonal vegetables and colourful plates"
          />
          <div>
            <p className="demo-kicker">THE MOOD</p>
            <h2>
              Come hungry.
              <br />
              Leave unhurried.
            </h2>
            <p>{s.story}</p>
            <a href="#request" className="restaurant-reserve">
              Make an evening of it ↗
            </a>
          </div>
        </section>
        <section id="request" className="restaurant-table">
          <div>
            <p className="demo-kicker">SAVE A SEAT</p>
            <h2>
              Who’s coming
              <br />
              to dinner?
            </h2>
            <p>
              Try the table enquiry. Actual opening hours, seating and
              availability would come from the venue.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setNotice(
                `Table for ${f.get("guests")} · ${f.get("date")} at ${f.get("time")}. ${previewNotice}`,
              );
            }}
          >
            <div className="restaurant-form-grid">
              <label>
                Guests
                <select name="guests">
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input name="date" type="date" min={today} required />
              </label>
              <label>
                Time
                <select name="time">
                  {["17:00", "18:00", "19:00", "20:00", "21:00"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Seating
                <select name="seating">
                  <option>Dining room</option>
                  <option>Chef’s counter</option>
                  <option>No preference</option>
                </select>
              </label>
            </div>
            <button className="restaurant-reserve" type="submit">
              Preview table request ↗
            </button>
            <p role="status">{notice}</p>
          </form>
        </section>
      </main>
    </>
  );
}

export function SpaExperience({ s }: Props) {
  const [selected, setSelected] = useState(0),
    [duration, setDuration] = useState(60),
    [time, setTime] = useState(""),
    [notice, setNotice] = useState("");
  const today = useToday();
  const baseDurations = [60, 45, 120];
  const durations = [baseDurations[selected], baseDurations[selected] + 30];
  const price =
    s.items[selected][2] + (duration - baseDurations[selected]) * 4000;
  const choose = (i: number) => {
    setSelected(i);
    setDuration(baseDurations[i]);
    setTime("");
    setNotice("");
  };
  return (
    <>
      <Header
        s={s}
        links={[
          ["collection", "The rituals"],
          ["story", "Our approach"],
        ]}
        action={
          <a href="#request" className="spa-link">
            Find your moment ↗
          </a>
        }
      />
      <main id="main" className="spa-main">
        <section className="spa-hero">
          <span className="spa-side-note">UBUD, BALI / A QUIETER RHYTHM</span>
          <div className="spa-hero-copy">
            <p className="demo-kicker">A WELLNESS HOUSE CONCEPT</p>
            <h1>
              Make room
              <br />
              for <em>stillness.</em>
            </h1>
            <p>{s.intro}</p>
            <a href="#collection" className="spa-link">
              Discover your ritual ↓
            </a>
          </div>
          <Photo name="spa" alt="Illustrative spa treatment setting" eager />
          <div className="spa-circle" aria-hidden="true">
            PAUSE
            <br />
            BREATHE
            <br />
            BEGIN AGAIN
          </div>
        </section>
        <section id="story" className="spa-philosophy">
          <span>✳</span>
          <p>
            Not another thing to do.
            <br />
            <em>A moment to simply be.</em>
          </p>
          <div>{s.story}</div>
        </section>
        <section id="collection" className="spa-treatment-layout">
          <div className="spa-treatments">
            <p className="demo-kicker">01 / CHOOSE YOUR RITUAL</p>
            <h2>
              What do you
              <br />
              need today?
            </h2>
            {s.items.map(([name, desc, price], i) => (
              <button
                key={name}
                aria-pressed={selected === i}
                className={`spa-treatment ${selected === i ? "selected" : ""}`}
                onClick={() => choose(i)}
              >
                <span className="spa-treatment-number">0{i + 1}</span>
                <span>
                  <strong>{name}</strong>
                  <small>{desc}</small>
                  <em>
                    {baseDurations[i]} min · from {money(price)}
                  </em>
                </span>
                <span>{selected === i ? "✓" : "+"}</span>
              </button>
            ))}
          </div>
          <aside id="request" className="spa-appointment">
            <p className="demo-kicker">02 / YOUR TIME, RESERVED</p>
            <h2>
              A little space
              <br />
              in your day.
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!time) {
                  setNotice("Choose a sample appointment time.");
                  return;
                }
                const f = new FormData(e.currentTarget);
                setNotice(
                  `${s.items[selected][0]} · ${duration} minutes · ${f.get("date")} at ${time}. ${previewNotice}`,
                );
              }}
            >
              <p className="spa-selected">{s.items[selected][0]}</p>
              <fieldset>
                <legend>How much time?</legend>
                <div className="exp-tabs">
                  {durations.map((n) => (
                    <button
                      type="button"
                      key={n}
                      aria-pressed={duration === n}
                      onClick={() => {
                        setDuration(n);
                        setNotice("");
                      }}
                    >
                      {n} min
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                Your preferred date
                <input
                  type="date"
                  name="date"
                  min={today}
                  required
                  onChange={() => {
                    setTime("");
                    setNotice("");
                  }}
                />
              </label>
              <fieldset>
                <legend>Sample appointment times</legend>
                <div className="spa-times">
                  {["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"].map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={time === t}
                        onClick={() => {
                          setTime(t);
                          setNotice("");
                        }}
                      >
                        {t}
                      </button>
                    ),
                  )}
                </div>
              </fieldset>
              <div className="spa-price">
                <span>Sample treatment price</span>
                <strong>{money(price)}</strong>
              </div>
              <button type="submit" className="spa-submit">
                Preview appointment ↗
              </button>
              <p role="status">{notice}</p>
              <p className="demo-small">
                Demonstration times, not live availability. No appointment or
                payment is made.
              </p>
            </form>
          </aside>
        </section>
        <section className="spa-closing">
          <Photo name="retreat" alt="Illustrative green Ubud landscape" />
          <div>
            <p className="demo-kicker">ARRIVE AS YOU ARE</p>
            <h2>
              Let the day
              <br />
              wait a little.
            </h2>
            <p>
              A quiet setting, a thoughtful welcome and enough time to feel at
              ease.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export function HotelExperience({ s }: Props) {
  const [room, setRoom] = useState(0),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [notice, setNotice] = useState("");
  const nights = daysBetween(start, end);
  return (
    <>
      <Header
        s={s}
        links={[
          ["collection", "Rooms & suites"],
          ["story", "The retreat"],
        ]}
        action={
          <a href="#request" className="hotel-reserve">
            Plan your stay ↗
          </a>
        }
      />
      <main id="main" className="hotel-main">
        <section className="hotel-hero">
          <Photo
            name="retreat"
            alt="Illustrative tropical Ubud pool and greenery"
            eager
          />
          <div>
            <p className="demo-kicker">A SMALL RETREAT / UBUD, BALI</p>
            <h1>
              A little closer
              <br />
              to <em>nature.</em>
            </h1>
            <p>{s.intro}</p>
          </div>
          <span className="hotel-coordinate">SLOW MORNINGS / OPEN WINDOWS</span>
        </section>
        <form
          id="request"
          className="hotel-booking-bar"
          onSubmit={(e) => {
            e.preventDefault();
            setNotice(
              nights
                ? `${s.items[room][0]} · ${nights} nights · ${money(nights * s.items[room][2])} sample room total. ${previewNotice}`
                : "Choose a departure after arrival.",
            );
          }}
        >
          <Dates start={start} end={end} onStart={setStart} onEnd={setEnd} />
          <label>
            Your room
            <select
              value={room}
              onChange={(e) => setRoom(Number(e.target.value))}
            >
              {s.items.map(([name], i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Guests
            <select>
              <option>1 guest</option>
              <option>2 guests</option>
            </select>
          </label>
          <button type="submit" className="hotel-reserve">
            Explore your stay →
          </button>
          <p role="status">{notice}</p>
        </form>
        <section id="story" className="hotel-welcome">
          <p className="demo-kicker">LEAVE A LITTLE ROOM IN YOUR ITINERARY</p>
          <h2>
            Nothing hurried.
            <br />
            <em>Everything considered.</em>
          </h2>
          <p>{s.story}</p>
        </section>
        <section id="collection" className="hotel-rooms">
          <div className="hotel-section-heading">
            <h2>
              Your own
              <br />
              little sanctuary.
            </h2>
            <p>
              Three ways to settle in.
              <br />
              Sample accommodation concepts.
            </p>
          </div>
          {s.items.map(([name, desc, rate], i) => (
            <article key={name} className="hotel-room">
              <Photo
                name={["interior", "retreat", "pool"][i]}
                alt={`Illustrative atmosphere for ${name}`}
              />
              <div>
                <span className="demo-kicker">0{i + 1} / ROOM COLLECTION</span>
                <h3>{name}</h3>
                <p>{desc}</p>
                <ul>
                  <li>King bed / 2 guests</li>
                  <li>
                    {
                      [
                        "Shaded terrace",
                        "Leafy outlook",
                        "Private outdoor space",
                      ][i]
                    }
                  </li>
                  <li>Sample breakfast inclusion</li>
                </ul>
                <div className="hotel-room-price">
                  <span>
                    From <strong>{money(rate)}</strong> / night
                  </span>
                  <button
                    onClick={() => {
                      setRoom(i);
                      setNotice("");
                      document
                        .getElementById("request")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Select room ↗
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export function VillaExperience({ s }: Props) {
  const [image, setImage] = useState(0),
    [plan, setPlan] = useState(2),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [notice, setNotice] = useState("");
  const photos = ["villa", "architecture", "interior"],
    labels = ["The pool terrace", "Open living", "Inside the house"],
    nights = daysBetween(start, end);
  const gallery = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Header
        s={s}
        links={[
          ["collection", "The house"],
          ["story", "The details"],
        ]}
        action={
          <a href="#request" className="villa-enquire">
            Enquire about a stay ↗
          </a>
        }
      />
      <main id="main" className="villa-main">
        <section className="villa-heading">
          <p className="demo-kicker">
            ONE HOUSE. YOUR OWN HORIZON. / ULUWATU, BALI
          </p>
          <h1>
            Room to <em>be together.</em>
          </h1>
          <div>
            <span>Private villa concept</span>
            <span>Up to 8 guests · 4 bedrooms · Private pool</span>
          </div>
        </section>
        <section className="villa-gallery" aria-label="Villa photographs">
          <button
            onClick={() => {
              setImage(0);
              gallery.current?.showModal();
            }}
          >
            <Photo
              name="villa"
              alt="Illustrative modern villa and private pool"
              eager
            />
            <span>Explore the house ↗</span>
          </button>
          <div>
            {[1, 2].map((i) => (
              <button
                key={i}
                onClick={() => {
                  setImage(i);
                  gallery.current?.showModal();
                }}
              >
                <Photo
                  name={photos[i]}
                  alt={`Illustrative villa moodboard: ${labels[i]}`}
                />
              </button>
            ))}
          </div>
        </section>
        <div className="villa-content">
          <div>
            <section id="collection" className="villa-house">
              <p className="demo-kicker">THE HOUSE, AT YOUR PACE</p>
              <h2>
                A place to gather.
                <br />
                Space to disappear.
              </h2>
              <p>{s.story}</p>
              <div className="villa-amenities">
                {[
                  "Private pool",
                  "Open living & dining",
                  "Kitchen concept",
                  "Outdoor terrace",
                  "Bedroom privacy",
                  "Space for a group",
                ].map((x, i) => (
                  <div key={x}>
                    <span>{["≈", "⌂", "◌", "☼", "◇", "↗"][i]}</span>
                    {x}
                  </div>
                ))}
              </div>
              <h3>Choose how you stay.</h3>
              <div
                className="villa-plan-tabs exp-tabs"
                aria-label="Villa configurations"
              >
                {s.items.map(([name], i) => (
                  <button
                    key={name}
                    aria-pressed={plan === i}
                    onClick={() => {
                      setPlan(i);
                      setNotice("");
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="villa-plan">
                <div
                  className="villa-floorplan"
                  aria-label={`Concept layout with ${plan + 2} bedrooms`}
                >
                  <span className="plan-living">Living / dining</span>
                  {Array.from({ length: plan + 2 }, (_, i) => (
                    <span key={i}>Bedroom {i + 1}</span>
                  ))}
                  <span className="plan-pool">Pool terrace</span>
                </div>
                <div>
                  <h3>{s.items[plan][0]}</h3>
                  <p>{s.items[plan][1]}</p>
                  <p className="demo-small">
                    Schematic illustration, not an architectural plan. The real
                    property would provide exact layouts and amenities.
                  </p>
                </div>
              </div>
            </section>
            <section id="story" className="villa-details">
              <h3>The details, before you arrive.</h3>
              {[
                [
                  "What is included?",
                  "This preview shows sample stay configurations. A real villa listing would confirm housekeeping, breakfast, transfers and pool arrangements.",
                ],
                [
                  "Where is the villa?",
                  "Uluwatu is the concept setting. A real listing would provide the verified address, route and arrival instructions.",
                ],
                [
                  "What are the booking terms?",
                  "Minimum stays, cancellation terms, deposits and check-in times would be confirmed by the property before payment.",
                ],
              ].map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <span>+</span>
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </section>
          </div>
          <aside id="request" className="villa-stay">
            <p className="demo-kicker">YOUR PRIVATE ESCAPE</p>
            <h2>
              Stay a little
              <br />
              longer.
            </h2>
            <p>
              <strong>{money(s.items[plan][2])}</strong> / night · sample rate
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotice(
                  nights
                    ? `${s.items[plan][0]} · ${nights} nights · ${money(nights * s.items[plan][2])} sample accommodation total. ${previewNotice}`
                    : "Choose a departure after arrival.",
                );
              }}
            >
              <Dates
                start={start}
                end={end}
                onStart={setStart}
                onEnd={setEnd}
              />
              <label>
                Guests
                <select key={plan}>
                  {Array.from({ length: (plan + 2) * 2 }, (_, i) => (
                    <option key={i}>
                      {i + 1} guest{i ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <div className="villa-estimate">
                <span>{nights ? `${nights} nights` : "Choose your dates"}</span>
                <strong>
                  {nights ? money(nights * s.items[plan][2]) : "—"}
                </strong>
              </div>
              <p className="demo-small">
                Accommodation only. Taxes, fees and availability are not
                calculated.
              </p>
              <button className="villa-enquire" type="submit">
                Preview stay enquiry ↗
              </button>
              <p role="status">{notice}</p>
            </form>
          </aside>
        </div>
      </main>
      <dialog
        ref={gallery}
        className="villa-lightbox"
        aria-label="Villa moodboard"
      >
        <button className="exp-close" onClick={() => gallery.current?.close()}>
          Close ×
        </button>
        <Photo
          name={photos[image]}
          alt={`Illustrative villa moodboard: ${labels[image]}`}
        />
        <div>
          <button onClick={() => setImage((image + 2) % 3)}>← Previous</button>
          <span>{labels[image]} / Illustrative photography</span>
          <button onClick={() => setImage((image + 1) % 3)}>Next →</button>
        </div>
      </dialog>
    </>
  );
}
