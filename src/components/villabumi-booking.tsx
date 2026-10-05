"use client";

import { useEffect, useState } from "react";
import {
  availableStay,
  isUnavailable,
  type BookingCurrency,
  type VillaBooking,
} from "@/lib/villabumi-booking";
import { villaBumi } from "@/lib/villabumi";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDate = (day: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(day),
  );

export function VillaBumiBooking({
  onDates,
}: {
  onDates: (arrival: string, departure: string) => void;
}) {
  const [currency, setCurrency] = useState<BookingCurrency>("USD");
  const [booking, setBooking] = useState<VillaBooking | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [offset, setOffset] = useState(0);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/villabumi/booking?currency=${currency}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Provider unavailable");
        return response.json() as Promise<VillaBooking>;
      })
      .then((data) => {
        setBooking(data);
        setError(false);
        if (arrival && departure && !availableStay(arrival, departure, data)) {
          setArrival("");
          setDeparture("");
          onDates("", "");
          setNotice("Availability changed. Please choose your dates again.");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(true);
          setBooking(null);
        }
      });
    return () => controller.abort();
    // A request is keyed by currency/retry; selection is independent of fetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, retry]);

  const ready = booking?.currency === currency && !error;
  function select(day: string) {
    if (!booking) return;
    setNotice("");
    if (!arrival || departure || day <= arrival) {
      setArrival(day);
      setDeparture("");
      onDates(day, "");
    } else if (availableStay(arrival, day, booking)) {
      setDeparture(day);
      onDates(arrival, day);
    } else {
      setNotice(
        "Your stay crosses an unavailable date. Choose another departure.",
      );
    }
  }
  function clear() {
    setArrival("");
    setDeparture("");
    setNotice("");
    onDates("", "");
  }

  return (
    <div className="bumi-booking" aria-busy={!ready && !error}>
      <div className="bumi-booking-top">
        <div>
          <p className="bumi-eyebrow">A LITTLE TIME AWAY</p>
          <h3>Find your dates.</h3>
        </div>
        <div className="bumi-calendar-nav">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!ready || offset === 0}
            onClick={() => setOffset((n) => n - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={!ready || offset === 11}
            onClick={() => setOffset((n) => n + 1)}
          >
            →
          </button>
        </div>
      </div>
      {error ? (
        <div className="bumi-booking-message" role="status">
          <p>
            We couldn’t load the calendar and nightly rates. Please try again or
            contact the villa.
          </p>
          <button
            type="button"
            onClick={() => {
              setError(false);
              setRetry((n) => n + 1);
            }}
          >
            Try again
          </button>
          <a
            href={villaBumi.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask Villa Bumi ↗
          </a>
        </div>
      ) : !ready ? (
        <p className="bumi-booking-message" role="status">
          Checking dates and nightly rates…
        </p>
      ) : (
        <>
          <p className="bumi-calendar-instruction">
            Choose an arrival, then a departure. Your dates will carry through
            to the enquiry below.
          </p>
          <div className="bumi-calendar-months">
            {[offset, offset + 1].map((monthOffset) => {
              const start = new Date(
                `${booking.today.slice(0, 7)}-01T00:00:00Z`,
              );
              start.setUTCMonth(start.getUTCMonth() + monthOffset);
              const year = start.getUTCFullYear();
              const month = start.getUTCMonth();
              const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
              const leading = (start.getUTCDay() + 6) % 7;
              const title = new Intl.DateTimeFormat("en", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(start);
              return (
                <section
                  className="bumi-calendar-month"
                  key={title}
                  aria-label={title}
                >
                  <h4>{title}</h4>
                  <div className="bumi-calendar-weekdays" aria-hidden="true">
                    {weekdays.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="bumi-calendar-days">
                    {Array.from({ length: leading }, (_, i) => (
                      <span key={`blank-${i}`} />
                    ))}
                    {Array.from({ length: count }, (_, i) => {
                      const day = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                      const booked = isUnavailable(day, booking);
                      // A booked day can be checkout: the final occupied night is the day before.
                      const checkout =
                        !!arrival &&
                        !departure &&
                        day > arrival &&
                        availableStay(arrival, day, booking);
                      const disabled =
                        day < booking.today || (booked && !checkout);
                      const selected = day === arrival || day === departure;
                      const between =
                        !!departure && day > arrival && day < departure;
                      return (
                        <button
                          type="button"
                          key={day}
                          data-date={day}
                          data-booked={booked}
                          disabled={disabled}
                          aria-pressed={selected}
                          aria-label={`${fullDate(day)}${booked ? (checkout ? ", checkout only" : ", unavailable") : ", available to enquire"}${day === arrival ? ", arrival" : day === departure ? ", departure" : ""}`}
                          className={`${selected ? "is-selected" : ""} ${between ? "is-between" : ""}`}
                          onClick={() => select(day)}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
          <div className="bumi-calendar-legend">
            <span>
              <i />
              Available to enquire
            </span>
            <span>
              <i className="is-booked" />
              Unavailable
            </span>
            <span>
              <i className="is-selected" />
              Your dates
            </span>
          </div>
          <div className="bumi-stay-selection">
            <div>
              <span className="bumi-eyebrow">YOUR STAY</span>
              <p>
                {arrival
                  ? `${fullDate(arrival)}${departure ? ` — ${fullDate(departure)}` : " — choose departure"}`
                  : "A slower pace starts with a date."}
              </p>
            </div>
            {arrival && (
              <button type="button" onClick={clear}>
                Clear dates
              </button>
            )}
            <a className="bumi-button" href="#contact">
              Enquire about a stay ↗
            </a>
          </div>
          <p className="bumi-fine" role="status">
            {notice ||
              "Availability supplied by Total Bali. Dates are an enquiry, not a reservation; please confirm with the villa."}
          </p>
          <div className="bumi-nightly-heading">
            <h3>Stay a little. Stay a while.</h3>
            <label>
              Nightly currency
              <select
                value={currency}
                onChange={(event) => {
                  setCurrency(event.target.value as BookingCurrency);
                  setError(false);
                }}
              >
                <option value="USD">USD</option>
                <option value="IDR">IDR</option>
              </select>
            </label>
          </div>
          <table className="bumi-nightly-rates">
            <caption className="bumi-visually-hidden">
              Published nightly rates for the entire three-bedroom villa,
              supplied by Total Bali
            </caption>
            <thead>
              <tr>
                <th scope="col">Season & stay details</th>
                <th scope="col">{currency} / night</th>
              </tr>
            </thead>
            <tbody>
              {booking.rates.map((rate, i) => (
                <tr key={`${rate.season}-${i}`}>
                  <th scope="row">
                    {rate.season}
                    <span>{rate.detail}</span>
                  </th>
                  <td>
                    {new Intl.NumberFormat("en", {
                      maximumFractionDigits: 0,
                    }).format(rate.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bumi-fine">
            Published seasonal rates, not a quote for your selected dates.
            Confirm the applicable season, minimum stay, taxes and final price
            with Villa Bumi.
          </p>
        </>
      )}
    </div>
  );
}
