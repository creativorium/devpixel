import {
  boundedJson,
  ownerAuthorized,
  saveInvoice,
  validateStoredInvoice,
} from "@/lib/invoice-store";
import { allowInvoiceRequest } from "@/lib/invoice-rate-limit";
export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
export async function POST(request: Request) {
  if (!allowInvoiceRequest(request))
    return Response.json(
      { message: "Please wait a minute before trying again." },
      { status: 429, headers: { ...headers, "Retry-After": "60" } },
    );
  if (!ownerAuthorized(request.headers.get("authorization")))
    return Response.json(
      {
        message:
          "Enter the correct owner password. Short links must first be configured in Netlify.",
      },
      { status: 401, headers },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json({ message: "Use JSON." }, { status: 415, headers });
  let data;
  try {
    data = validateStoredInvoice(await boundedJson(request));
  } catch {
    return Response.json(
      {
        message:
          "Check the invoice fields and dates. Short links support up to 45,000 characters; use a snapshot or PDF for larger invoices.",
      },
      { status: 400, headers },
    );
  }
  try {
    return Response.json(await saveInvoice(data), { status: 201, headers });
  } catch {
    return Response.json(
      {
        message:
          "Could not save the invoice. Check the Google Sheets setup. If a request timed out, check the sheet before retrying.",
      },
      { status: 503, headers },
    );
  }
}
