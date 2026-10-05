import test from "node:test";
import assert from "node:assert/strict";
import {
  availableStay,
  baliToday,
  isUnavailable,
  publicBooking,
} from "../src/lib/villabumi-booking";
import { GET } from "../src/app/api/villabumi/booking/route";

const provider = {
  success: true,
  data: {
    id: 53,
    email: "PRIVATE_CONTACT",
    room_availability: [
      {
        start_date: "2026-10-10",
        end_date: "2026-10-12",
        summary: "PRIVATE_GUEST_NAME",
        description: "PRIVATE_BOOKING_DETAILS",
      },
    ],
    rates: {
      season_rates: [
        {
          type: "low_season",
          details: "<p>Weekdays<br /><em>Minimum 3 nights</em></p>",
          end_date: "2025-01-17 00:00:00",
          rooms: [{ total_bedroom: "3", currency: "USD", price: "303" }],
        },
        {
          type: "special_rate",
          details: "Expired July offer",
          end_date: "2026-07-31 00:00:00",
          rooms: [{ total_bedroom: "3", currency: "USD", price: "283" }],
        },
      ],
    },
  },
};

test("only dates and published rates leave the server; expired offers and HTML are removed", () => {
  const result = publicBooking(provider, "USD", "2026-10-05");
  assert.deepEqual(result.unavailable, [
    { start: "2026-10-10", end: "2026-10-12" },
  ]);
  assert.deepEqual(result.rates, [
    { season: "Low Season", detail: "Weekdays\nMinimum 3 nights", amount: 303 },
  ]);
  assert.ok(!JSON.stringify(result).includes("PRIVATE_"));
});

test("date boundaries match the calendar; checkout is allowed before an unavailable night", () => {
  const booking = publicBooking(provider, "USD", "2026-10-05");
  assert.ok(isUnavailable("2026-10-10", booking));
  assert.ok(!isUnavailable("2026-10-12", booking));
  assert.ok(availableStay("2026-10-12", "2026-10-15", booking));
  assert.ok(!isUnavailable("2026-10-13", booking));
  assert.ok(availableStay("2026-10-08", "2026-10-10", booking));
  assert.ok(!availableStay("2026-10-08", "2026-10-13", booking));
  assert.ok(!availableStay("2026-10-13", "2026-10-13", booking));
});

test("invalid provider data never becomes a fully available calendar", () => {
  assert.throws(() => publicBooking({ data: { id: 53 } }, "USD"));
  const invalid = structuredClone(provider);
  invalid.data.room_availability[0].start_date = "2026-02-30";
  assert.throws(() => publicBooking(invalid, "USD"));
  assert.throws(() => publicBooking(provider, "IDR"));
});

test("Bali date advances at UTC+8, independently of the server timezone", () => {
  assert.equal(baliToday(new Date("2026-10-05T17:00:00Z")), "2026-10-06");
});

test("booking route uses fixed read-only sources and fails cleanly", async () => {
  const original = globalThis.fetch;
  let url = "";
  try {
    globalThis.fetch = async (input) => {
      url = String(input);
      return Response.json(provider);
    };
    const response = await GET(
      new Request("http://localhost/api/villabumi/booking?currency=USD"),
    );
    assert.equal(response.status, 200);
    assert.equal(
      url,
      "https://admin.baliweddingvilla.com/api/v1/villa/details?villa_id=53&curs_exchanges_id=1",
    );
    assert.ok(!(await response.text()).includes("PRIVATE_"));
    assert.equal(
      (
        await GET(
          new Request("http://localhost/api/villabumi/booking?currency=BAD"),
        )
      ).status,
      400,
    );
    globalThis.fetch = async () => {
      throw new Error("Provider failure");
    };
    const failure = await GET(
      new Request("http://localhost/api/villabumi/booking"),
    );
    assert.equal(failure.status, 502);
    assert.deepEqual(await failure.json(), {
      error: "Availability and nightly rates are temporarily unavailable.",
    });
  } finally {
    globalThis.fetch = original;
  }
});
