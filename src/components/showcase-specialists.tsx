"use client";
import Image from "next/image";
import { useState } from "react";

export function FurnitureCategories({
  choose,
}: {
  choose: (category: string) => void;
}) {
  return (
    <section className="nf-categories" id="approach">
      <div>
        <span className="rd-eyebrow">START WITH THE WAY YOU LIVE</span>
        <h2>
          Good pieces.
          <br />
          In their element.
        </h2>
        <p>
          Find a comfortable seat, a gathering place, or a little warmth for
          your favourite corner.
        </p>
      </div>
      {[
        ["Seating", "The living edit", "interior"],
        ["Tables", "Around the table", "architecture"],
        ["Lighting", "A softer light", "interior"],
      ].map(([category, title, photo], i) => (
        <a key={category} href="#collection" onClick={() => choose(category)}>
          <div>
            <Image
              src={`/showcase/${photo}.jpg`}
              alt={`${title} — illustrative furniture setting`}
              fill
              sizes="(max-width:700px) 50vw, 24vw"
              style={{ objectPosition: i === 2 ? "30% 45%" : "center" }}
            />
          </div>
          <span>
            0{i + 1} / {category}
          </span>
          <h3>
            {title} <span>↗</span>
          </h3>
        </a>
      ))}
    </section>
  );
}
const finishes = [
  {
    name: "Natural oak",
    color: "#cba77a",
    grain: true,
    detail:
      "A light, open grain that sits comfortably with linen and warm neutrals.",
    care: "Dust with a soft dry cloth. Avoid standing water and direct heat.",
    best: "Tables, shelving and timber frames",
  },
  {
    name: "Smoked walnut",
    color: "#70513b",
    grain: true,
    detail:
      "Deeper brown tones for a more grounded room. Pair with lighter upholstery.",
    care: "Use a soft cloth and coasters. Keep away from strong direct sunlight.",
    best: "Side tables and statement timber pieces",
  },
  {
    name: "Oat linen",
    color: "#d7cdb8",
    grain: false,
    detail:
      "A relaxed woven texture, with a warm neutral tone and a soft hand.",
    care: "Spot-clean gently. Confirm the cover's care instructions before washing.",
    best: "Chairs, cushions and upholstered seating",
  },
];
export function FurnitureMaterials() {
  const [active, setActive] = useState(0);
  const finish = finishes[active];
  return (
    <section className="nf-materials" id="materials">
      <div
        className="nf-material-sample"
        style={{ backgroundColor: finish.color, color: active === 1 ? "#fff9ed" : "#382c20" }}
      >
        <span className="nf-swatch-number">0{active + 1} / MATERIAL STUDY</span>
        <div className={finish.grain ? "nf-timber" : "nf-linen"} />
        <span>
          {finish.name}
          <small>Digital finish illustration</small>
        </span>
      </div>
      <div className="nf-material-copy">
        <span className="rd-eyebrow">GET TO KNOW YOUR MATERIALS</span>
        <h2>
          It starts
          <br />
          with the feel.
        </h2>
        <div className="nf-swatches" aria-label="Explore sample finishes">
          {finishes.map((item, index) => (
            <button
              key={item.name}
              aria-label={item.name}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              style={{ backgroundColor: item.color }}
            >
              <span className="rd-sr-label">{item.name}</span>
            </button>
          ))}
        </div>
        <div aria-live="polite">
          <h3>{finish.name}</h3>
          <p>{finish.detail}</p>
          <dl>
            <div>
              <dt>Consider it for</dt>
              <dd>{finish.best}</dd>
            </div>
            <div>
              <dt>Everyday care</dt>
              <dd>{finish.care}</dd>
            </div>
          </dl>
        </div>
        <p className="rd-small">
          Illustrative finishes. Actual colour, grain and specifications vary by
          piece; request a physical swatch before purchasing.
        </p>
      </div>
    </section>
  );
}
export function FurnitureDelivery() {
  return (
    <section className="nf-delivery" id="spaces">
      <div>
        <span className="rd-eyebrow">FROM OUR EDIT TO YOUR HOME</span>
        <h2>
          A little planning.
          <br />A better fit.
        </h2>
        <p>The useful details that make choosing furniture easier.</p>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Measure your space</h3>
              <p>Check the piece, the room and the route through your doors.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Choose your finish</h3>
              <p>Compare samples in the light where the piece will live.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Plan the arrival</h3>
              <p>
                Confirm access, delivery options and assembly with the store.
              </p>
            </div>
          </li>
        </ol>
      </div>
      <div className="nf-help">
        {[
          [
            "Will this piece fit?",
            "Use the illustrative dimensions in the product details as a starting point. Measure doorways, stairs, lifts and turning space too. A real store would confirm exact product and package dimensions.",
          ],
          [
            "Can I choose another finish?",
            "Explore the material guide above. In a live collection, available finishes, upholstery samples and custom options would be listed against each piece.",
          ],
          [
            "How would delivery work?",
            "Delivery areas, lead times and assembly charges need to be confirmed for the actual store and delivery address. This concept does not make delivery promises.",
          ],
          [
            "Can I place an order here?",
            "The bag is a working preview of the shopping flow. It does not take payments or submit orders. A live store would include its verified returns policy and checkout terms.",
          ],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const spaces = [
  {
    name: "Bedrooms",
    heading: "A quiet place of your own.",
    copy: "Separate bedrooms give everyone a place to retreat, with shared spaces just a few steps away. Compare the two- and three-bedroom concept layouts below.",
    note: "SLEEP / 2–3 BEDROOM OPTIONS",
    photo: "interior",
  },
  {
    name: "Living & dining",
    heading: "The heart of the house.",
    copy: "An open-plan kitchen, dining area and lounge form one generous gathering space. Think shared breakfasts and long evenings at the table.",
    note: "GATHER / OPEN-PLAN LIVING",
    photo: "architecture",
  },
  {
    name: "Pool terrace",
    heading: "Stay out a little longer.",
    copy: "Living flows onto a poolside terrace. A private outdoor setting is central to this concept; actual pool dimensions, fencing and safety provisions would need to be verified.",
    note: "OUTSIDE / PRIVATE POOL CONCEPT",
    photo: "villa",
  },
];
export function VillaSpaceGuide() {
  const [selected, setSelected] = useState(0);
  const space = spaces[selected];
  return (
    <section className="sv-space-guide" id="villa">
      <div className="sv-space-title">
        <span className="rd-eyebrow">EXPLORE THE HOUSE</span>
        <h2>
          One villa.
          <br />
          Room for everyone.
        </h2>
        <p>See how private corners and shared spaces fit together.</p>
        <div className="sv-space-tabs" aria-label="Explore villa spaces">
          {spaces.map((item, index) => (
            <button
              key={item.name}
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              <span>0{index + 1}</span>
              {item.name}
              <span>↗</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sv-plan">
        <span>CONCEPT SPACE GUIDE / NOT TO SCALE</span>
        <svg
          viewBox="0 0 500 370"
          role="img"
          aria-label={`Concept plan highlighting ${space.name}`}
        >
          <path
            d="M30 30h440v310H30z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="42"
            y="42"
            width="130"
            height="125"
            fill={selected === 0 ? "#929e89" : "#e4e5dc"}
          />
          <rect
            x="42"
            y="180"
            width="130"
            height="145"
            fill={selected === 0 ? "#929e89" : "#e4e5dc"}
          />
          <rect
            x="185"
            y="42"
            width="150"
            height="283"
            fill={selected === 1 ? "#929e89" : "#e4e5dc"}
          />
          <rect
            x="348"
            y="42"
            width="110"
            height="283"
            fill={selected === 2 ? "#86a5a2" : "#d9e1dd"}
          />
          <g fill="none" stroke="#626f5e" strokeWidth="1.5">
            <rect x="62" y="65" width="88" height="65" />
            <path d="M62 81h88M105 65v16" />
            <rect x="62" y="210" width="88" height="65" />
            <path d="M62 226h88M105 210v16" />
            <rect x="211" y="80" width="95" height="45" />
            <rect x="211" y="210" width="95" height="64" />
            <path d="M211 230h95M240 230v44M277 230v44" />
            <path d="M365 72h75v212h-75z" />
          </g>
          <g
            fill="#253022"
            fontSize="11"
            fontFamily="Arial,sans-serif"
            textAnchor="middle"
          >
            <text x="107" y="150">
              BEDROOM 01
            </text>
            <text x="107" y="305">
              BEDROOM 02
            </text>
            <text x="260" y="160">
              DINING
            </text>
            <text x="260" y="300">
              LIVING
            </text>
            <text x="402" y="310">
              POOL
            </text>
          </g>
        </svg>
        <p>
          Illustrative arrangement. A third-bedroom option would use an
          additional private wing.
        </p>
      </div>
      <div className="sv-space-detail" aria-live="polite">
        <div className="sv-space-photo">
          <Image
            src={`/showcase/${space.photo}.jpg`}
            alt={space.name + " — illustrative villa space"}
            fill
            sizes="(max-width:700px) 100vw, 34vw"
          />
        </div>
        <span className="rd-eyebrow">{space.note}</span>
        <h3>{space.heading}</h3>
        <p>{space.copy}</p>
      </div>
    </section>
  );
}
export function VillaStayDetails({
  rooms,
  choose,
}: {
  rooms: string;
  choose: (rooms: string) => void;
}) {
  return (
    <>
      <section className="sv-stay-details" id="stays">
        <div>
          <span className="rd-eyebrow">PLAN THE PRACTICAL PART</span>
          <h2>
            A stay that
            <br />
            fits your people.
          </h2>
          <p>
            Choose an illustrative configuration, then bring your dates and
            questions to the enquiry preview.
          </p>
          <fieldset>
            <legend>Sample configuration</legend>
            {[
              ["2", "Two bedrooms", "Up to 4 guests", "Rp 3,800,000"],
              ["3", "Three bedrooms", "Up to 6 guests", "Rp 5,200,000"],
            ].map(([value, name, guests, rate]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="stay-rooms"
                  value={value}
                  checked={rooms === value}
                  onChange={() => choose(value)}
                />
                <span>
                  <strong>{name}</strong>
                  <small>{guests}</small>
                </span>
                <span>
                  From {rate}
                  <small>/ night · sample rate</small>
                </span>
              </label>
            ))}
          </fieldset>
          <a href="#enquire" className="rd-pill rd-dark">
            Plan this stay →
          </a>
        </div>
        <div className="sv-stay-ledger">
          <h3>At a glance</h3>
          <dl>
            {[
              ["The booking", "One private villa concept"],
              [
                "Your group",
                rooms === "2"
                  ? "Up to 4 guests / two bedrooms"
                  : "Up to 6 guests / three bedrooms",
              ],
              ["Shared spaces", "Living, dining and pool terrace"],
              ["Arrival & departure", "Confirm times with your host"],
              ["Accessibility", "Ask about steps and access"],
              ["Families", "Verify pool and child-safety provisions"],
            ].map(([title, copy]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{copy}</dd>
              </div>
            ))}
          </dl>
          <p>
            Rates and layouts are illustrative, not live availability. Confirm
            taxes, inclusions, minimum nights and cancellation terms with the
            actual property.
          </p>
        </div>
      </section>
      <section className="sv-guest-info" id="guest-info">
        <div>
          <span className="rd-eyebrow">BEFORE YOU ARRIVE</span>
          <h2>
            A few useful
            <br />
            things to know.
          </h2>
        </div>
        <div>
          {[
            [
              "How do I check available dates?",
              "This is a design concept, so the calendar is not connected to a real property. The form below previews a stay enquiry without sending a reservation.",
            ],
            [
              "What is included in a stay?",
              "In a live property website, housekeeping, meals, airport transfers, taxes and optional services would be listed here using details confirmed by the host.",
            ],
            [
              "Is the villa suitable for children?",
              "Ask the actual host about pool fencing, stairs, balcony access, cots and supervision. The illustrative photography and concept plan do not establish safety provisions.",
            ],
            [
              "What if our plans change?",
              "Cancellation, amendment and payment terms would be shown before booking. This preview does not take deposits or establish a cancellation policy.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
