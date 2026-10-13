"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Showcase } from "@/lib/showcase";
import { VillaOpening, VillaJourney } from "./villa-direction";

type Props = { s: Showcase };
const subscribe = () => () => {};
const blank = () => "";
const today = () => new Date().toLocaleDateString("en-CA");
const money = (n: number) =>
  new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const preview = "This is a preview. Nothing has been booked, ordered or sent.";
function Photo({
  name,
  alt,
  eager = false,
  className = "",
}: {
  name: string;
  alt: string;
  eager?: boolean;
  className?: string;
}) {
  return (
    <div className={`v-photo ${className}`}>
      <Image
        src={`/showcase/${name}.jpg`}
        alt={alt}
        fill
        sizes="(max-width:700px) 100vw, 65vw"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
    </div>
  );
}
function Nav({
  s,
  links,
  action,
}: {
  s: Showcase;
  links: [string, string][];
  action: ReactNode;
}) {
  return (
    <header className="v-nav">
      <Link className="v-brand" href={`/showcase/${s.slug}`}>
        {s.name}
      </Link>
      <nav aria-label={`${s.name} navigation`}>
        {links.map(([href, label]) => (
          <a href={href} key={href}>
            {label}
          </a>
        ))}
      </nav>
      {action}
    </header>
  );
}
function Hero({
  s,
  action,
  label,
  children,
}: {
  s: Showcase;
  action: ReactNode;
  label?: string;
  children?: ReactNode;
}) {
  const photos = s.gallery || [s.image];
  return (
    <section className={`v-hero v-hero-${s.variant}`}>
      <div className="v-hero-copy">
        <p className="v-kicker">
          {label || s.location} / {s.style}
        </p>
        <h1>{s.headline}</h1>
        <p className="v-lead">{s.intro}</p>
        {action}
      </div>
      <Photo name={s.image} alt={`Illustrative setting for ${s.name}`} eager />
      {s.variant === 2 && (
        <Photo
          name={photos[1] || s.image}
          alt={`Illustrative detail for ${s.name}`}
          className="v-hero-detail"
        />
      )}
      {s.variant === 4 && (
        <span className="v-hero-index">
          0{s.variant + 1}
          <small>
            AN INDEPENDENT
            <br />
            DESIGN CONCEPT
          </small>
        </span>
      )}
      {children}
    </section>
  );
}
function Story({ s }: { s: Showcase }) {
  return (
    <section id="story" className={`v-story v-story-${s.variant}`}>
      <p className="v-kicker">A NOTE FROM {s.name.split("/")[0]}</p>
      <h2>{s.features[0]}.</h2>
      <p>{s.story}</p>
      <div className="v-feature-list">
        {s.features.map((f, i) => (
          <span key={f}>
            <small>0{i + 1}</small>
            {f}
          </span>
        ))}
      </div>
    </section>
  );
}
function Gallery({ s }: { s: Showcase }) {
  const [active, setActive] = useState(0),
    ref = useRef<HTMLDialogElement>(null),
    photos = s.gallery || [s.image];
  return (
    <section id="gallery" className="v-gallery">
      <div className="v-section-title">
        <p className="v-kicker">A CLOSER LOOK</p>
        <h2>The feeling of being here.</h2>
      </div>
      <div className="v-gallery-grid">
        {photos.map((p, i) => (
          <button
            key={i}
            aria-label={`Open photograph ${i + 1}`}
            onClick={() => {
              setActive(i);
              ref.current?.showModal();
            }}
          >
            <Photo
              name={p}
              alt={`Illustrative moodboard for ${s.name}, image ${i + 1}`}
            />
            <span>0{i + 1} / Explore ↗</span>
          </button>
        ))}
      </div>
      <dialog
        ref={ref}
        className="v-lightbox"
        aria-label="Concept photo gallery"
      >
        <button className="v-close" onClick={() => ref.current?.close()}>
          Close ×
        </button>
        <Photo
          name={photos[active]}
          alt={`Illustrative moodboard image ${active + 1}`}
        />
        <div>
          <button
            onClick={() =>
              setActive((active + photos.length - 1) % photos.length)
            }
          >
            ← Previous
          </button>
          <span>
            Illustrative photography / {active + 1} of {photos.length}
          </span>
          <button onClick={() => setActive((active + 1) % photos.length)}>
            Next →
          </button>
        </div>
      </dialog>
    </section>
  );
}
function DateFields({
  start,
  end,
  onStart,
  onEnd,
}: {
  start: string;
  end: string;
  onStart: (x: string) => void;
  onEnd: (x: string) => void;
}) {
  const min = useSyncExternalStore(subscribe, today, blank);
  return (
    <div className="v-date-fields">
      <label>
        Start date
        <input
          type="date"
          value={start}
          min={min}
          required
          onChange={(e) => onStart(e.target.value)}
        />
      </label>
      <label>
        End date
        <input
          type="date"
          value={end}
          min={start || min}
          required
          onChange={(e) => onEnd(e.target.value)}
        />
      </label>
    </div>
  );
}
function duration(start: string, end: string) {
  const n = (Date.parse(end) - Date.parse(start)) / 86400000;
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function Selection({
  s,
  selected,
  onSelect,
}: {
  s: Showcase;
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="v-choice-list">
      {s.items.map(([name, desc, rate], i) => (
        <button
          key={name}
          aria-pressed={selected === i}
          onClick={() => onSelect(i)}
        >
          <span className="v-choice-number">0{i + 1}</span>
          <span>
            <strong>{name}</strong>
            <small>{desc}</small>
            <em>{money(rate)}</em>
          </span>
          <b>{selected === i ? "✓" : "+"}</b>
        </button>
      ))}
    </div>
  );
}
function StayForm({
  s,
  selected,
  setSelected,
  villa = false,
}: {
  s: Showcase;
  selected: number;
  setSelected: (i: number) => void;
  villa?: boolean;
}) {
  const [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [notice, setNotice] = useState("");
  const nights = duration(start, end);
  return (
    <form
      className="v-stay-form"
      onChange={() => setNotice("")}
      onSubmit={(e) => {
        e.preventDefault();
        setNotice(
          nights
            ? `${s.items[selected][0]} · ${nights} nights · ${money(nights * s.items[selected][2])} sample accommodation total. ${preview}`
            : "Choose an end date after your start date.",
        );
      }}
    >
      <p className="v-kicker">YOUR STAY / SAMPLE ENQUIRY</p>
      <h2>{villa ? "Make yourself at home." : "Find your kind of stay."}</h2>
      <label>
        {villa ? "Stay configuration" : "Room type"}
        <select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          {s.items.map(([name], i) => (
            <option key={name} value={i}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <DateFields start={start} end={end} onStart={setStart} onEnd={setEnd} />
      <label>
        Guests
        <select key={selected}>
          {Array.from(
            { length: villa ? (selected + 2) * 2 : selected === 2 ? 4 : 2 },
            (_, i) => (
              <option key={i}>{i + 1}</option>
            ),
          )}
        </select>
      </label>
      <div className="v-estimate">
        <span>{nights ? `${nights} nights` : "Choose your dates"}</span>
        <strong>{nights ? money(nights * s.items[selected][2]) : "—"}</strong>
      </div>
      <button type="submit" className="v-button">
        Preview stay request ↗
      </button>
      <p className="v-status" role="status">
        {notice}
      </p>
      <p className="v-fine">
        Sample rates only. Taxes, fees and live availability are not included.
      </p>
    </form>
  );
}

export function VariantHotel({ s }: Props) {
  const [selected, setSelected] = useState(0);
  const photos = s.gallery || [s.image];
  const select = (i: number) => {
    setSelected(i);
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
  };
  const rooms = (
    <section id="collection" className={`v-rooms v-rooms-${s.variant}`}>
      <div className="v-section-title">
        <p className="v-kicker">THE ROOM COLLECTION</p>
        <h2>
          {s.variant === 2
            ? "Space for your everyday."
            : s.variant === 3
              ? "Notes from a slower stay."
              : s.variant === 4
                ? "Behind the door."
                : "Pick your sunny corner."}
        </h2>
      </div>
      {s.variant === 2 ? (
        <div className="v-residence-table">
          {s.items.map(([name, desc, rate], i) => (
            <article key={name}>
              <span>0{i + 1}</span>
              <Photo
                name={photos[i % photos.length]}
                alt={`Sample mood for ${name}`}
              />
              <div>
                <h3>{name}</h3>
                <p>{desc}</p>
                <small>
                  {i === 2 ? "4 guests / 2 bedrooms" : "2 guests / 1 bedroom"}
                </small>
              </div>
              <div>
                <strong>{money(rate)}</strong>
                <small>Sample nightly rate</small>
                <button className="v-link" onClick={() => select(i)}>
                  Select this room ↗
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="v-room-cards">
          {s.items.map(([name, desc, rate], i) => (
            <article key={name}>
              <Photo
                name={photos[i % photos.length]}
                alt={`Illustrative atmosphere for ${name}`}
              />
              <div>
                <span className="v-kicker">
                  0{i + 1} / {i === 2 ? "SPACE TO SHARE" : "SPACE FOR TWO"}
                </span>
                <h3>{name}</h3>
                <p>{desc}</p>
                <div className="v-card-foot">
                  <strong>
                    {money(rate)}
                    <small> / night</small>
                  </strong>
                  <button className="v-link" onClick={() => select(i)}>
                    Explore stay ↗
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
  return (
    <>
      <Nav
        s={s}
        links={[
          ["#collection", "Rooms"],
          ["#story", "The place"],
          ["#gallery", "Explore"],
        ]}
        action={
          <a className="v-button" href="#request">
            Plan a stay ↗
          </a>
        }
      />
      <main id="main" className={`v-site v-hotel v-variant-${s.variant}`}>
        <Hero
          s={s}
          action={
            <a className="v-button" href="#collection">
              Explore the rooms ↓
            </a>
          }
        />
        {s.variant === 1 && (
          <div className="v-day-strip">
            {[
              "08:00 / A slow breakfast",
              "12:00 / Find the pool",
              "17:00 / One more conversation",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
        {s.variant === 3 ? (
          <>
            <Story s={s} />
            {rooms}
          </>
        ) : (
          <>
            {rooms}
            <Story s={s} />
          </>
        )}
        <section id="request" className="v-stay-section">
          <Photo
            name={s.variant === 2 ? "coast" : photos[1] || s.image}
            alt={`Illustrative stay detail for ${s.name}`}
          />
          <StayForm s={s} selected={selected} setSelected={setSelected} />
        </section>
        <Gallery s={s} />
      </main>
    </>
  );
}

export function VariantVilla({ s }: Props) {
  const [selected, setSelected] = useState(2);
  const photos = s.gallery || [s.image];
  return (
    <>
      <Nav
        s={s}
        links={[
          ["#collection", "The house"],
          ["#gallery", "Photographs"],
          ["#story", "The setting"],
        ]}
        action={
          <a href="#request" className="v-button">
            Enquire about a stay ↗
          </a>
        }
      />
      <main id="main" className={`v-site v-villa v-variant-${s.variant}`}>
        <VillaOpening s={s} />
        <VillaJourney s={s} />
        <div className="v-property-stats">
          <span>
            <b>04</b>Bedrooms / concept
          </span>
          <span>
            <b>08</b>Guests / maximum
          </span>
          <span>
            <b>01</b>Private place to gather
          </span>
        </div>
        {s.variant === 3 && <Gallery s={s} />}
        <div className="v-villa-body">
          <div>
            <section id="collection" className="v-house-details">
              <p className="v-kicker">THE HOUSE / IN DETAIL</p>
              <h2>
                {s.variant === 1
                  ? "A study in open space."
                  : s.variant === 2
                    ? "Everyone, under one roof."
                    : s.variant === 3
                      ? "The horizon is part of the plan."
                      : "An occasion, made your own."}
              </h2>
              <p>{s.story}</p>
              <div className="v-house-mosaic">
                <Photo
                  name={photos[1] || s.image}
                  alt="Illustrative living space"
                />
                <Photo
                  name={photos[2] || s.image}
                  alt="Illustrative house detail"
                />
              </div>
              <div className="v-house-facts">
                {[
                  "Private bedrooms",
                  "Shared living room",
                  "Kitchen concept",
                  "Outdoor gathering",
                  "Terrace & garden",
                  "Space for a group",
                ].map((f, i) => (
                  <span key={f}>
                    <b>0{i + 1}</b>
                    {f}
                  </span>
                ))}
              </div>
              <h3>Make room for your people.</h3>
              <Selection s={s} selected={selected} onSelect={setSelected} />
              <div
                className="v-plan"
                aria-label={`Schematic ${selected + 2} bedroom layout`}
              >
                <span className="v-plan-shared">Shared living / dining</span>
                {Array.from({ length: selected + 2 }, (_, i) => (
                  <span key={i}>Bedroom {i + 1}</span>
                ))}
                <span className="v-plan-outside">Outdoor living</span>
              </div>
              <p className="v-fine">
                Illustrative configuration, not an architectural plan. Actual
                facilities and capacity must be confirmed.
              </p>
            </section>
            <section id="story" className="v-house-faq">
              <h3>A few useful details.</h3>
              {[
                [
                  "Where is the house?",
                  `${s.location} is the concept location. Exact address and arrival instructions would be supplied by the real property.`,
                ],
                [
                  "Can we book the whole property?",
                  "The configurations demonstrate different group stays. A real property would confirm room access, inclusions and availability.",
                ],
                [
                  "What are the stay conditions?",
                  "Deposits, cancellation terms, housekeeping and minimum nights would be confirmed before any real reservation.",
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
          <aside id="request">
            <StayForm
              s={s}
              selected={selected}
              setSelected={setSelected}
              villa
            />
          </aside>
        </div>
        {s.variant !== 3 && <Gallery s={s} />}
      </main>
    </>
  );
}

export function VariantRestaurant({ s }: Props) {
  const groups = s.itemGroups || ["Menu", "Menu", "Menu"],
    tabs = ["All", ...new Set(groups)],
    [tab, setTab] = useState("All"),
    [notice, setNotice] = useState("");
  const min = useSyncExternalStore(subscribe, today, blank);
  const menu = (
    <section id="collection" className={`v-menu v-menu-${s.variant}`}>
      <div className="v-menu-intro">
        <p className="v-kicker">FROM OUR SAMPLE MENU</p>
        <h2>
          {s.variant === 1
            ? "Crumbs encouraged."
            : s.variant === 2
              ? "In season. On the table."
              : s.variant === 3
                ? "For one. For everyone."
                : "The evening, in a few plates."}
        </h2>
        <div className="v-tabs" aria-label="Menu categories">
          {tabs.map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <p className="v-fine">
          Illustrative menu. Ingredients, allergens, dietary requirements and
          prices must be confirmed with a real venue.
        </p>
      </div>
      <div className="v-menu-items">
        {s.items.map(
          ([name, desc, rate], i) =>
            (tab === "All" || groups[i] === tab) && (
              <article key={name}>
                {s.variant === 1 && (
                  <Photo
                    name={s.gallery?.[i] || s.image}
                    alt={`Illustrative atmosphere for ${groups[i]}`}
                  />
                )}
                <div className="v-menu-item-top">
                  <span className="v-kicker">{groups[i]}</span>
                  <span>{money(rate)}</span>
                </div>
                <h3>{name}</h3>
                <p>{desc}</p>
              </article>
            ),
        )}
      </div>
    </section>
  );
  return (
    <>
      <Nav
        s={s}
        links={[
          ["#collection", "Menu"],
          ["#story", "Our place"],
          ["#request", "Visit"],
        ]}
        action={
          <a className="v-button" href="#request">
            Find a table ↗
          </a>
        }
      />
      <main id="main" className={`v-site v-restaurant v-variant-${s.variant}`}>
        <Hero
          s={s}
          action={
            <a className="v-button" href="#collection">
              Take a look at the menu ↓
            </a>
          }
        />
        {s.variant === 4 ? (
          <>
            <section className="v-counter-note">
              <span>SMALL COUNTER.</span>
              <strong>Stay for the conversation.</strong>
              <span>CONCEPT EVENING SERVICE / 18:00–22:00</span>
            </section>
            {menu}
          </>
        ) : s.variant === 2 ? (
          <>
            <Story s={s} />
            {menu}
          </>
        ) : (
          menu
        )}
        {s.variant !== 2 && <Story s={s} />}
        <section id="request" className="v-table-request">
          <div>
            <p className="v-kicker">SAVE A LITTLE TIME FOR US</p>
            <h2>
              {s.variant === 1
                ? "See you for breakfast?"
                : "Your table is the start."}
            </h2>
            <p>
              Try a table enquiry. This design preview does not check
              availability or send a reservation.
            </p>
            <p className="v-hours">
              Sample hours /{" "}
              {s.variant === 1
                ? "07:00–16:00"
                : s.variant === 4
                  ? "18:00–22:00"
                  : "12:00–22:00"}
              <br />
              {s.location}
            </p>
          </div>
          <form
            onChange={() => setNotice("")}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setNotice(
                `${f.get("guests")} guests · ${f.get("date")} at ${f.get("time")} · ${f.get("seat")}. ${preview}`,
              );
            }}
          >
            <label>
              Preferred date
              <input type="date" name="date" min={min} required />
            </label>
            <div className="v-date-fields">
              <label>
                Guests
                <select name="guests">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select name="time">
                  {(s.variant === 1
                    ? ["08:00", "09:30", "11:00", "13:00"]
                    : s.variant === 4
                      ? ["18:00", "19:30", "21:00"]
                      : ["12:00", "14:00", "18:00", "20:00"]
                  ).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Where would you like to sit?
              <select name="seat">
                <option>{s.variant === 4 ? "Counter" : "Dining room"}</option>
                <option>
                  {s.variant === 4 ? "Small table" : "Outdoor table"}
                </option>
                <option>No preference</option>
              </select>
            </label>
            <button type="submit" className="v-button">
              Preview table request ↗
            </button>
            <p role="status" className="v-status">
              {notice}
            </p>
          </form>
        </section>
        <Gallery s={s} />
      </main>
    </>
  );
}

export function VariantSpa({ s }: Props) {
  const bases = (s.options || ["60", "45", "120"]).map(Number),
    [selected, setSelected] = useState(0),
    [extra, setExtra] = useState(false),
    [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [notice, setNotice] = useState("");
  const min = useSyncExternalStore(subscribe, today, blank),
    minutes = bases[selected] + (extra ? 30 : 0),
    price = s.items[selected][2] + (extra ? 120000 : 0);
  const choose = (i: number) => {
    setSelected(i);
    setExtra(false);
    setTime("");
    setNotice("");
  };
  return (
    <>
      <Nav
        s={s}
        links={[
          ["#collection", s.variant === 2 ? "Sessions" : "Treatments"],
          ["#story", "Our approach"],
        ]}
        action={
          <a className="v-button" href="#request">
            Find your moment ↗
          </a>
        }
      />
      <main id="main" className={`v-site v-spa v-variant-${s.variant}`}>
        <Hero
          s={s}
          action={
            <a href="#collection" className="v-button">
              {s.variant === 2
                ? "Explore the sessions"
                : "Discover the rituals"}{" "}
              ↓
            </a>
          }
        />
        {s.variant === 3 && (
          <section className="v-ritual-steps">
            <span>01 / Arrive</span>
            <span>02 / Settle</span>
            <span>03 / Unwind</span>
            <span>04 / Begin again</span>
          </section>
        )}
        {s.variant === 1 && <Story s={s} />}
        <section className="v-spa-planner">
          <div id="collection">
            <p className="v-kicker">
              01 / CHOOSE YOUR {s.variant === 2 ? "SESSION" : "RITUAL"}
            </p>
            <h2>
              {s.variant === 1
                ? "What feels right today?"
                : s.variant === 2
                  ? "A rhythm that fits."
                  : s.variant === 3
                    ? "A quieter sequence."
                    : "Time, thoughtfully spent."}
            </h2>
            {s.variant === 2 ? (
              <div className="v-session-table">
                {s.items.map(([name, desc, rate], i) => (
                  <button
                    key={name}
                    aria-pressed={selected === i}
                    onClick={() => choose(i)}
                  >
                    <span>
                      {bases[i]}
                      <small>MINUTES</small>
                    </span>
                    <div>
                      <strong>{name}</strong>
                      <p>{desc}</p>
                    </div>
                    <span>
                      {money(rate)}
                      <small>
                        {selected === i ? "SELECTED ✓" : "SELECT +"}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <Selection s={s} selected={selected} onSelect={choose} />
            )}
            <p className="v-fine">
              Sample treatments and durations. Real service details and
              suitability are confirmed by the provider.
            </p>
          </div>
          <aside id="request">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotice(
                  time
                    ? `${s.items[selected][0]} · ${minutes} minutes · ${date} at ${time} · ${money(price)}. ${preview}`
                    : "Choose a sample appointment time.",
                );
              }}
            >
              <p className="v-kicker">02 / MAKE SPACE IN YOUR DAY</p>
              <h3>{s.items[selected][0]}</h3>
              <fieldset>
                <legend>Duration</legend>
                <div className="v-tabs">
                  <button
                    type="button"
                    aria-pressed={!extra}
                    onClick={() => {
                      setExtra(false);
                      setNotice("");
                    }}
                  >
                    {bases[selected]} min
                  </button>
                  <button
                    type="button"
                    aria-pressed={extra}
                    onClick={() => {
                      setExtra(true);
                      setNotice("");
                    }}
                  >
                    {bases[selected] + 30} min
                  </button>
                </div>
              </fieldset>
              <label>
                Preferred date
                <input
                  type="date"
                  value={date}
                  min={min}
                  required
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                    setNotice("");
                  }}
                />
              </label>
              <fieldset>
                <legend>Sample time slots</legend>
                <div className="v-time-grid">
                  {["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"].map(
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
              <div className="v-estimate">
                <span>Sample total</span>
                <strong>{money(price)}</strong>
              </div>
              <button className="v-button" type="submit">
                Preview appointment ↗
              </button>
              <p className="v-status" role="status">
                {notice}
              </p>
              <p className="v-fine">
                No live availability. No appointment is created.
              </p>
            </form>
          </aside>
        </section>
        {s.variant !== 1 && <Story s={s} />}
        <Gallery s={s} />
      </main>
    </>
  );
}

function Equipment({ s, index }: { s: Showcase; index: number }) {
  const slug = s.slug;
  return (
    <svg
      className={`v-equipment equipment-${index}`}
      viewBox="0 0 440 240"
      role="img"
      aria-label={`Sample illustration: ${s.items[index][0]}`}
    >
      <ellipse
        cx="220"
        cy="212"
        rx="175"
        ry="12"
        fill="currentColor"
        opacity=".1"
      />
      {slug.startsWith("north") ? (
        <>
          <path
            d={`M45 158 L70 108 L126 96 L165 ${index === 2 ? 52 : 70} L${index === 2 ? 320 : 290} ${index === 2 ? 52 : 70} L352 106 L391 120 L405 180 L45 180Z`}
            fill="currentColor"
          />
          <path
            d="M151 101 L177 80 L275 80 L310 106Z"
            fill="var(--v-paper)"
            opacity=".85"
          />
          <rect
            x="61"
            y="133"
            width="35"
            height="14"
            rx="5"
            fill="var(--v-paper)"
          />
          <rect x="358" y="135" width="30" height="10" fill="var(--v-paper)" />
          <g fill="#242c2c" stroke="var(--v-paper)" strokeWidth="6">
            <circle cx="116" cy="181" r="35" />
            <circle cx="338" cy="181" r="35" />
          </g>
          <path
            d="M215 110 V157 M158 148 H186"
            stroke="var(--v-paper)"
            strokeWidth="4"
          />
        </>
      ) : slug.startsWith("drift") ? (
        <>
          <path
            d={
              index === 2
                ? "M220 25 Q310 88 242 204 L198 204 Q130 88 220 25Z"
                : "M220 18 C300 25 298 187 240 213 L200 213 C140 187 140 25 220 18Z"
            }
            fill="currentColor"
          />
          <path d="M220 24 V208" stroke="var(--v-paper)" strokeWidth="5" />
          <path
            d="M184 130 Q220 150 256 130 M176 151 Q220 173 264 151"
            stroke="var(--v-paper)"
            strokeWidth="9"
            fill="none"
            opacity=".6"
          />
        </>
      ) : slug.startsWith("pedal") ? (
        <>
          <g fill="none" stroke="currentColor" strokeWidth="8">
            <circle cx="92" cy="165" r="49" />
            <circle cx="348" cy="165" r="49" />
            <path d="M92 165 L164 92 L222 166 L92 165 M164 92 L305 92 L222 166 M348 165 L297 56 L326 41 M164 92 L153 60" />
          </g>
          <path
            d="M131 57 H182"
            stroke="#283c36"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="222" cy="166" r="13" fill="currentColor" />
          {index === 2 && (
            <rect
              x="242"
              y="107"
              width="45"
              height="20"
              rx="5"
              transform="rotate(-35 242 107)"
              fill="currentColor"
            />
          )}
        </>
      ) : (
        <>
          <rect
            x="80"
            y="74"
            width="285"
            height="125"
            rx="16"
            fill="currentColor"
          />
          <path d="M123 75 L149 45 H225 L253 76" fill="currentColor" />
          <circle
            cx="229"
            cy="138"
            r="62"
            fill="#222b2a"
            stroke="var(--v-paper)"
            strokeWidth="9"
          />
          <circle cx="229" cy="138" r="38" fill="#527c85" />
          <circle cx="229" cy="138" r="20" fill="#263f45" />
          <rect
            x="305"
            y="88"
            width="33"
            height="17"
            rx="5"
            fill="var(--v-paper)"
          />
          {index === 2 && (
            <path
              d="M130 44 V20 H324 V71"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
            />
          )}
        </>
      )}
    </svg>
  );
}
const queryItem = () => {
  const n = Number(new URLSearchParams(window.location.search).get("item"));
  return n >= 0 && n < 3 && Number.isInteger(n) ? n : 0;
};
export function VariantRental({
  s,
  browse = false,
}: Props & { browse?: boolean }) {
  const initial = useSyncExternalStore(subscribe, queryItem, () => 0),
    [choice, setChoice] = useState<number | null>(null),
    [filter, setFilter] = useState("All"),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [delivery, setDelivery] = useState(false),
    [notice, setNotice] = useState("");
  const selected = choice ?? initial,
    days = duration(start, end),
    total = days * s.items[selected][2] + (delivery ? 75000 : 0),
    groups = s.itemGroups || ["Option 1", "Option 2", "Option 3"];
  const cards = (home: boolean) => (
    <div className="v-equipment-grid">
      {s.items.map(
        ([name, desc, rate], i) =>
          (home || filter === "All" || groups[i] === filter) && (
            <article
              key={name}
              className={!home && selected === i ? "is-selected" : ""}
            >
              <span className="v-kicker">
                0{i + 1} / {groups[i]}
              </span>
              <Equipment s={s} index={i} />
              <h3>{name}</h3>
              <p>{desc}</p>
              <div className="v-card-foot">
                <strong>
                  {money(rate)}
                  <small> / day</small>
                </strong>
                {home ? (
                  <Link
                    className="v-link"
                    href={`/showcase/${s.slug}/rentals?item=${i}`}
                  >
                    Choose ↗
                  </Link>
                ) : (
                  <button
                    className="v-button"
                    aria-pressed={selected === i}
                    onClick={() => {
                      setChoice(i);
                      setNotice("");
                    }}
                  >
                    {selected === i ? "Selected ✓" : "Select +"}
                  </button>
                )}
              </div>
            </article>
          ),
      )}
    </div>
  );
  return (
    <>
      <Nav
        s={s}
        links={[["#how", "How it works"]]}
        action={
          <Link
            className="v-button"
            href={
              browse ? `/showcase/${s.slug}` : `/showcase/${s.slug}/rentals`
            }
          >
            {browse ? "← Rental home" : "Browse rentals ↗"}
          </Link>
        }
      />
      <main id="main" className={`v-site v-rental v-variant-${s.variant}`}>
        {!browse ? (
          <>
            <Hero
              s={s}
              action={
                <Link className="v-button" href={`/showcase/${s.slug}/rentals`}>
                  Find your{" "}
                  {s.slug.startsWith("north")
                    ? "car"
                    : s.slug.startsWith("drift")
                      ? "board"
                      : s.slug.startsWith("pedal")
                        ? "bike"
                        : "kit"}{" "}
                  ↗
                </Link>
              }
            />
            <section className="v-rental-home-catalog">
              <div className="v-section-title">
                <p className="v-kicker">THE SAMPLE COLLECTION</p>
                <h2>
                  {s.variant === 1
                    ? "Room for the whole plan."
                    : s.variant === 2
                      ? "Find the right shape."
                      : s.variant === 3
                        ? "A different pace of day."
                        : "The kit is just the beginning."}
                </h2>
              </div>
              {cards(true)}
            </section>
            <Story s={s} />
          </>
        ) : (
          <>
            <div className="v-rental-title">
              <p className="v-kicker">{s.location} / RENTAL PLANNER</p>
              <h1>Choose. Plan. Explore.</h1>
              <p>Compare the sample options and build a rental estimate.</p>
            </div>
            <div className="v-rental-planner">
              <section>
                <div className="v-tabs" aria-label="Equipment categories">
                  {["All", ...groups].map((g) => (
                    <button
                      key={g}
                      aria-pressed={filter === g}
                      onClick={() => setFilter(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {cards(false)}
                <p className="v-fine">
                  Illustrations show sample equipment, not actual inventory or
                  condition.
                </p>
              </section>
              <aside id="request">
                <form
                  onChange={() => setNotice("")}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNotice(
                      days
                        ? `${s.items[selected][0]} · ${days} days · ${money(total)} sample estimate. ${preview}`
                        : "Choose a return date after pickup.",
                    );
                  }}
                >
                  <p className="v-kicker">YOUR RENTAL PLAN</p>
                  <h2>{s.items[selected][0]}</h2>
                  <Equipment s={s} index={selected} />
                  <DateFields
                    start={start}
                    end={end}
                    onStart={setStart}
                    onEnd={setEnd}
                  />
                  <label>
                    Collection
                    <select
                      value={delivery ? "delivery" : "pickup"}
                      onChange={(e) =>
                        setDelivery(e.target.value === "delivery")
                      }
                    >
                      <option value="pickup">Collect from operator</option>
                      <option value="delivery">
                        Request delivery · {money(75000)}
                      </option>
                    </select>
                  </label>
                  <div className="v-estimate">
                    <span>
                      {days
                        ? `${days} days + ${delivery ? "delivery" : "pickup"}`
                        : "Choose dates"}
                    </span>
                    <strong>{days ? money(total) : "—"}</strong>
                  </div>
                  <button className="v-button" type="submit">
                    Preview rental request ↗
                  </button>
                  <p className="v-status" role="status">
                    {notice}
                  </p>
                  <p className="v-fine">
                    No live availability, payment or booking. The real operator
                    confirms requirements, deposits and coverage.
                  </p>
                </form>
              </aside>
            </div>
          </>
        )}
        <section id="how" className="v-rental-process">
          <h2>
            A clear route
            <br />
            from here.
          </h2>
          {[
            [
              "01",
              "Compare the options",
              "Read the sample equipment descriptions and daily rates.",
            ],
            ["02", "Build a plan", "Choose dates and collection preferences."],
            [
              "03",
              "Confirm with the team",
              "A real operator checks availability, suitability and terms.",
            ],
          ].map(([n, t, p]) => (
            <article key={n}>
              <small>{n}</small>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

function ProductArt({
  s,
  index,
  option,
}: {
  s: Showcase;
  index: number;
  option: string;
}) {
  const type = s.productKind;
  return (
    <div
      className={`v-product-art art-${type} art-item-${index % 3} ${type !== "apparel" && option === s.options?.[1] ? "art-alternate" : ""}`}
      aria-hidden="true"
    >
      <div className="v-art-shadow" />
      {type === "apparel" ? (
        <div className="v-garment">
          <i />
          <span>{s.name.split("/")[0]}</span>
        </div>
      ) : type === "surf" ? (
        <div className="v-surf-product">
          <i />
          <span>TIDE</span>
        </div>
      ) : type === "beauty" ? (
        <div className="v-bottle">
          <i />
          <span>
            BOTAN
            <small>
              DAILY CARE
              <br />
              CONCEPT /{" "}
              {index % 3 === 0
                ? "CLEANSE"
                : index % 3 === 1
                  ? "LOTION"
                  : "BODY"}
            </small>
          </span>
        </div>
      ) : (
        <div className="v-coffee-bag">
          <i />
          <span>
            GROUND
            <small>
              {s.items[index][0]}
              <br />
              SAMPLE COFFEE / 250 G
            </small>
          </span>
          <b>0{index + 1}</b>
        </div>
      )}
    </div>
  );
}
export function VariantShop({ s }: Props) {
  const groups = s.itemGroups || s.items.map(() => "Collection"),
    options = s.options || ["Standard"],
    [filter, setFilter] = useState("All"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("Featured"),
    [selectedOptions, setSelectedOptions] = useState(
      s.items.map(() => options[0]),
    ),
    [bag, setBag] = useState<Record<string, number>>({}),
    [product, setProduct] = useState<number | null>(null),
    [notice, setNotice] = useState("");
  const cart = useRef<HTMLDialogElement>(null),
    detail = useRef<HTMLDialogElement>(null),
    total = Object.entries(bag).reduce(
      (a, [key, qty]) => a + s.items[Number(key.split(":")[0])][2] * qty,
      0,
    ),
    count = Object.values(bag).reduce((a, b) => a + b, 0);
  const indices = s.items
    .map((_, i) => i)
    .filter(
      (i) =>
        (filter === "All" || groups[i] === filter) &&
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
    const key = `${i}:${selectedOptions[i]}`;
    setBag((v) => ({ ...v, [key]: Math.min(10, (v[key] || 0) + 1) }));
    setNotice(
      `${s.items[i][0]} / ${selectedOptions[i]} added to your sample bag.`,
    );
  };
  const categories = (
    <div className="v-shop-categories" aria-label="Shop collections">
      {["All", ...new Set(groups)].map((g) => (
        <button
          key={g}
          aria-pressed={filter === g}
          onClick={() => setFilter(g)}
        >
          {g}
          <span>
            {g === "All"
              ? s.items.length
              : groups.filter((x) => x === g).length}
          </span>
        </button>
      ))}
    </div>
  );
  return (
    <>
      <div className="v-shop-announcement">
        {s.variant === 1
          ? "OUTSIDE IS A GOOD PLACE TO BE"
          : s.variant === 2
            ? "A SMALL WARDROBE / A NEW PERSPECTIVE"
            : s.variant === 3
              ? "SMALL ROUTINES. EVERYDAY CARE."
              : "GOOD COFFEE. NO COMPLICATED CHOICES."}{" "}
        <span>CONCEPT STORE / BALI</span>
      </div>
      <Nav
        s={s}
        links={[
          ["#collection", "Shop"],
          ["#story", s.variant === 4 ? "Brew notes" : "Our story"],
        ]}
        action={
          <button
            className="v-bag-trigger"
            onClick={() => cart.current?.showModal()}
          >
            Bag ({count}) ↗
          </button>
        }
      />
      <main id="main" className={`v-site v-shop v-variant-${s.variant}`}>
        <Hero
          s={s}
          action={
            <a className="v-button" href="#collection">
              Shop the collection ↗
            </a>
          }
          label="THE NEW COLLECTION"
        />
        {s.variant === 3 && (
          <div className="v-care-strip">
            <span>01 / Cleanse</span>
            <span>02 / Moisturise</span>
            <span>03 / Take your time</span>
          </div>
        )}
        <section
          id="collection"
          className={`v-shop-catalog shop-catalog-${s.variant}`}
        >
          <div className="v-section-title">
            <div>
              <p className="v-kicker">THE EVERYDAY EDIT</p>
              <h2>
                {s.variant === 1
                  ? "Gear for good days."
                  : s.variant === 2
                    ? "The collection."
                    : s.variant === 3
                      ? "Keep it simple."
                      : "Find your next favourite."}
              </h2>
            </div>
            <span className="v-result-count">{indices.length} products</span>
          </div>
          <div className="v-shop-controls">
            <label>
              Search products
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find something good"
              />
            </label>
            <label>
              Sort products
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Featured</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
            </label>
          </div>
          <div className="v-shop-layout">
            {categories}
            <div className="v-product-grid">
              {indices.map((i) => (
                <article className="v-product" key={i}>
                  <button
                    className="v-product-preview"
                    aria-label={`View ${s.items[i][0]}`}
                    onClick={() => {
                      setProduct(i);
                      detail.current?.showModal();
                    }}
                  >
                    <ProductArt s={s} index={i} option={selectedOptions[i]} />
                    <span className="v-product-badge">
                      {i === 0 ? "THE EVERYDAY EDIT" : "CONCEPT PRODUCT"}
                    </span>
                    <span className="v-quick-view">Quick view +</span>
                  </button>
                  <div className="v-product-info">
                    <h3>{s.items[i][0]}</h3>
                    <strong>{money(s.items[i][2])}</strong>
                  </div>
                  <p>
                    {groups[i]} / {selectedOptions[i]}
                  </p>
                  <div
                    className="v-product-options"
                    aria-label={`Options for ${s.items[i][0]}`}
                  >
                    {options.map((o) => (
                      <button
                        key={o}
                        aria-label={`${o} for ${s.items[i][0]}`}
                        aria-pressed={selectedOptions[i] === o}
                        onClick={() =>
                          setSelectedOptions((v) =>
                            v.map((old, n) => (n === i ? o : old)),
                          )
                        }
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <button className="v-add-to-bag" onClick={() => add(i)}>
                    Add to bag <span>+</span>
                  </button>
                </article>
              ))}
              {!indices.length && (
                <p className="v-empty">
                  No products match. Try a different search or collection.
                </p>
              )}
            </div>
          </div>
          <p role="status" className="v-status">
            {notice}
          </p>
        </section>
        <section id="story" className="v-shop-story">
          <Photo
            name={s.gallery?.[1] || s.image}
            alt={`Illustrative brand mood for ${s.name}`}
          />
          <div>
            <p className="v-kicker">BEHIND THE COLLECTION</p>
            <h2>{s.features[0] || s.headline}</h2>
            <p>{s.story}</p>
            <a href="#collection" className="v-link">
              Back to the collection ↗
            </a>
            <details>
              <summary>
                {s.variant === 4
                  ? "A note on brewing"
                  : "Details, delivery & returns"}{" "}
                +
              </summary>
              <p className="v-fine">
                {s.variant === 4
                  ? "This is a sample coffee catalogue. A real roaster would provide origin, roast date and brewing guidance for every product."
                  : "These are fictional products and visual illustrations. Real materials, sizing, ingredients, delivery charges and return policies would be supplied by the merchant before launch."}
              </p>
            </details>
          </div>
        </section>
      </main>
      <dialog
        ref={detail}
        className="v-product-dialog"
        aria-label="Product details"
      >
        <button className="v-close" onClick={() => detail.current?.close()}>
          Close ×
        </button>
        {product !== null && (
          <div className="v-product-detail">
            <ProductArt
              s={s}
              index={product}
              option={selectedOptions[product]}
            />
            <div>
              <p className="v-kicker">
                {groups[product]} / {s.name}
              </p>
              <h2>{s.items[product][0]}</h2>
              <strong>{money(s.items[product][2])}</strong>
              <p>{s.items[product][1]}</p>
              <label>
                {s.productKind === "apparel"
                  ? "Size"
                  : s.productKind === "coffee"
                    ? "Grind"
                    : s.productKind === "beauty"
                      ? "Format"
                      : "Colour"}
                <select
                  value={selectedOptions[product]}
                  onChange={(e) =>
                    setSelectedOptions((v) =>
                      v.map((old, n) => (n === product ? e.target.value : old)),
                    )
                  }
                >
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <p className="v-fine">
                Sample product and price. No live stock or delivery check.
              </p>
              <button
                className="v-button"
                onClick={() => {
                  add(product);
                  detail.current?.close();
                  cart.current?.showModal();
                }}
              >
                Add to bag ↗
              </button>
            </div>
          </div>
        )}
      </dialog>
      <dialog ref={cart} className="v-cart-drawer" aria-label="Shopping bag">
        <div className="v-cart-header">
          <h2>Your bag ({count})</h2>
          <button
            aria-label="Close shopping bag"
            onClick={() => cart.current?.close()}
          >
            ×
          </button>
        </div>
        {!count && <p>Your bag is ready for something good.</p>}
        {Object.entries(bag)
          .filter(([, q]) => q > 0)
          .map(([key, qty]) => {
            const [id, option] = key.split(":"),
              i = Number(id);
            return (
              <article className="v-cart-line" key={key}>
                <ProductArt s={s} index={i} option={option} />
                <div>
                  <h3>{s.items[i][0]}</h3>
                  <p>
                    {option} / {money(s.items[i][2])}
                  </p>
                  <div className="v-quantity">
                    <button
                      aria-label={`Remove one ${s.items[i][0]} ${option}`}
                      onClick={() => {
                        setBag((v) => ({ ...v, [key]: qty - 1 }));
                        setNotice("");
                      }}
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      disabled={qty >= 10}
                      aria-label={`Add one ${s.items[i][0]} ${option}`}
                      onClick={() => {
                        setBag((v) => ({ ...v, [key]: qty + 1 }));
                        setNotice("");
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        <div className="v-estimate">
          <span>Sample subtotal</span>
          <strong>{money(total)}</strong>
        </div>
        <p className="v-fine">
          Taxes and shipping are not calculated. This is a storefront demo, not
          a live store.
        </p>
        <button
          className="v-button"
          disabled={!count}
          onClick={() =>
            setNotice(
              `Sample checkout: ${count} items, ${money(total)}. No order or payment has been created.`,
            )
          }
        >
          Preview checkout →
        </button>
        <p className="v-status" role="status">
          {notice}
        </p>
        <button className="v-link" onClick={() => cart.current?.close()}>
          Continue shopping
        </button>
      </dialog>
    </>
  );
}

export function ShowcaseVariant({
  s,
  browse = false,
}: Props & { browse?: boolean }) {
  return (
    <div
      className={`variant-shell variant-shell-${s.variant}`}
      style={
        {
          "--v-paper": s.palette[0],
          "--v-ink": s.palette[1],
          "--v-accent": s.palette[2],
        } as React.CSSProperties
      }
    >
      {s.category === "Shops / Ecommerce" ? (
        <VariantShop s={s} />
      ) : s.category === "Rental" ? (
        <VariantRental s={s} browse={browse} />
      ) : s.category === "Cafe / Restaurant" ? (
        <VariantRestaurant s={s} />
      ) : s.category === "Spa / Wellness" ? (
        <VariantSpa s={s} />
      ) : s.category === "Villa" ? (
        <VariantVilla s={s} />
      ) : (
        <VariantHotel s={s} />
      )}
    </div>
  );
}
