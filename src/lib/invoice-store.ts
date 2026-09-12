// Server-only: imported exclusively by invoice API routes.
import { GoogleAuth } from "google-auth-library";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { invoiceSchema, totals, type Invoice } from "./invoice";
import { site } from "./site";

export const invoiceIdPattern = /^[A-Za-z0-9_-]{24}$/;
export const invoiceHeaders = [
  "ID",
  "Created UTC",
  "Invoice number",
  "Client",
  "Currency",
  "Total",
  "View link",
  "Snapshot JSON",
  "Status",
];
export function ownerAuthorized(
  header: string | null,
  secret = process.env.INVOICE_OWNER_SECRET,
) {
  if (
    !secret ||
    secret.length < 32 ||
    !header?.startsWith("Bearer ") ||
    header.length > 1024
  )
    return false;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(header.slice(7)), hash(secret));
}

export async function boundedJson(
  response: Response | Request,
  limit = 250_000,
): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    reader.releaseLock();
  }
}

type SheetValues = { values?: unknown[][]; updates?: { updatedRows?: number } };
export type SheetRequest = (
  range: string,
  values?: (string | number)[][],
) => Promise<SheetValues>;
let auth: GoogleAuth | undefined;
const sheetRequest: SheetRequest = async (range, values) => {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!id || !/^[\w-]+$/.test(id) || !email || !key)
    throw new Error("Sheets configuration missing");
  auth ??= new GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const token = await auth.getAccessToken();
  if (!token) throw new Error("Sheets authentication unavailable");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(range)}${values ? ":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS" : ""}`;
  const response = await fetch(url, {
    method: values ? "POST" : "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(values
      ? { body: JSON.stringify({ majorDimension: "ROWS", values }) }
      : {}),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error("Sheets request failed");
  }
  return (await boundedJson(response, 1_000_000)) as SheetValues;
};

export function validateStoredInvoice(value: unknown): Invoice {
  const data = invoiceSchema.parse(value);
  if (
    !data.client.trim() ||
    !data.company.trim() ||
    !data.number.trim() ||
    data.due < data.issued ||
    data.items.some((i) => !i.description.trim())
  )
    throw new Error("Incomplete invoice");
  // Sheets cells are limited in size. Leave headroom under the 50,000-character limit.
  if (JSON.stringify(data).length > 45_000)
    throw new Error(
      "Invoice is too large for a short link. Use a snapshot link or PDF instead.",
    );
  return data;
}

export async function saveInvoice(
  value: unknown,
  request: SheetRequest = sheetRequest,
) {
  const data = validateStoredInvoice(value);
  const headers = (await request("Invoices!A1:I1")).values?.[0];
  if (!headers || invoiceHeaders.some((h, i) => headers[i] !== h))
    throw new Error("Invoice sheet headers missing");
  const id = randomBytes(18).toString("base64url");
  const url = `${site.url}/i/${id}`;
  // RAW is essential: user-supplied values must never become spreadsheet formulas.
  const result = await request("Invoices!A:I", [
    [
      id,
      new Date().toISOString(),
      data.number,
      data.client,
      data.currency,
      totals(data).total,
      url,
      JSON.stringify(data),
      "active",
    ],
  ]);
  if (result.updates?.updatedRows !== 1)
    throw new Error("Invoice save not confirmed");
  return { id, url };
}

export async function loadInvoice(
  id: string,
  request: SheetRequest = sheetRequest,
): Promise<Invoice | null> {
  if (!invoiceIdPattern.test(id)) return null;
  // Fetch identifiers first; do not load every client's invoice into memory.
  const ids = (await request("Invoices!A2:A")).values ?? [];
  const index = ids.findIndex((row) => row[0] === id);
  if (index < 0) return null;
  const rowNumber = index + 2;
  const row = (await request(`Invoices!A${rowNumber}:I${rowNumber}`))
    .values?.[0];
  // Recheck ID in case the owner sorted the sheet between requests.
  if (
    !row ||
    row[0] !== id ||
    row[8] !== "active" ||
    typeof row[7] !== "string"
  )
    return null;
  return validateStoredInvoice(JSON.parse(row[7]));
}
