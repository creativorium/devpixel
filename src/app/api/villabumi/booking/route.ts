import { publicBooking, type BookingCurrency } from "@/lib/villabumi-booking";

export async function GET(request: Request) {
  const currency = new URL(request.url).searchParams.get("currency") || "USD";
  if (currency !== "USD" && currency !== "IDR")
    return Response.json({ error: "Unsupported currency" }, { status: 400 });
  try {
    // Fixed villa and currency allowlist; no provider key or arbitrary URL input.
    const response = await fetch(
      `https://admin.baliweddingvilla.com/api/v1/villa/details?villa_id=53&curs_exchanges_id=${currency === "USD" ? 1 : 7}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(12_000) },
    );
    if (!response.ok) throw new Error("Provider unavailable");
    return Response.json(
      publicBooking(await response.json(), currency as BookingCurrency),
      { headers: { "Cache-Control": "public, s-maxage=60, max-age=0" } },
    );
  } catch {
    return Response.json(
      { error: "Availability and nightly rates are temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
