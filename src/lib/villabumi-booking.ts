export type BookingCurrency = "USD" | "IDR";
export type VillaBooking = {
  currency: BookingCurrency;
  today: string;
  unavailable: { start: string; end: string }[];
  rates: { season: string; detail: string; amount: number }[];
};

export function baliToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function date(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Invalid availability date");
  if (new Date(value).toISOString().slice(0, 10) !== value)
    throw new Error("Invalid availability date");
  return value;
}

function plainText(value: string) {
  return value
    .replace(/<br\s*\/?\s*>|<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&ndash;|&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

// The provider also returns reservation names and contact information.
// Return only public pricing and unavailable dates to the browser.
export function publicBooking(
  payload: unknown,
  currency: BookingCurrency,
  today = baliToday(),
): VillaBooking {
  const data = (
    payload as {
      success?: boolean;
      data?: {
        id?: number;
        room_availability?: { start_date: string; end_date: string }[];
        rates?: {
          season_rates?: {
            type: string;
            details: string;
            end_date: string;
            rooms: { total_bedroom: string; currency: string; price: string }[];
          }[];
        };
      };
    }
  )?.data;
  if (
    data?.id !== 53 ||
    !Array.isArray(data.room_availability) ||
    !Array.isArray(data.rates?.season_rates)
  )
    throw new Error("Unavailable provider data");
  const unavailable = data.room_availability.map((range) => {
    const start = date(range.start_date);
    const end = date(range.end_date);
    if (start > end) throw new Error("Invalid availability range");
    return { start, end };
  });
  const rates = data.rates.season_rates
    .filter(
      (rate) =>
        rate.type !== "special_rate" ||
        date(rate.end_date.slice(0, 10)) >= today,
    )
    .map((rate) => {
      const room = rate.rooms.find(
        (r) => Number(r.total_bedroom) === 3 && r.currency === currency,
      );
      const amount = Number(room?.price);
      if (!Number.isFinite(amount) || amount <= 0)
        throw new Error("Unavailable provider rate");
      return {
        season: rate.type
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        detail: plainText(rate.details),
        amount,
      };
    });
  if (!rates.length) throw new Error("Unavailable provider rates");
  return { currency, today, unavailable, rates };
}

export function isUnavailable(day: string, booking: VillaBooking) {
  // The original calendar shows check-in on the right half and checkout on
  // the left half. The checkout date is free for the following night.
  return booking.unavailable.some((r) => day >= r.start && day < r.end);
}

export function availableStay(
  arrival: string,
  departure: string,
  booking: VillaBooking,
) {
  if (arrival >= departure) return false;
  const checkout = new Date(departure).getTime();
  const first = new Date(arrival).getTime();
  if (!Number.isFinite(first) || !Number.isFinite(checkout)) return false;
  for (let time = first; time < checkout; time += 86_400_000) {
    if (isUnavailable(new Date(time).toISOString().slice(0, 10), booking))
      return false;
  }
  return true;
}
