import { invoiceSchema, type Invoice } from "./invoice";
const maxBytes = 250_000;
const maxEncoded = 16_000;
async function boundedRead(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maxBytes) {
        await reader.cancel();
        throw new Error(
          "This invoice is too large to share as a link. Use PDF instead.",
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
export async function createInvoiceSnapshot(invoice: Invoice): Promise<string> {
  const data = invoiceSchema.parse(invoice);
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (bytes.length > maxBytes)
    throw new Error(
      "This invoice is too large to share as a link. Use PDF instead.",
    );
  const compressed = await boundedRead(
    new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")),
  );
  const encoded = btoa(
    Array.from(compressed, (b) => String.fromCharCode(b)).join(""),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  if (encoded.length > maxEncoded)
    throw new Error(
      "This invoice would create a very long link. Shorten the details or send a PDF instead.",
    );
  return "v1." + encoded;
}
export async function readInvoiceSnapshot(fragment: string): Promise<Invoice> {
  const value = fragment.replace(/^#/, "");
  if (!/^v1\.[A-Za-z0-9_-]+$/.test(value) || value.length > maxEncoded + 3)
    throw new Error(
      "This invoice link is incomplete or invalid. Ask the sender for a new link.",
    );
  try {
    const encoded = value.slice(3).replaceAll("-", "+").replaceAll("_", "/");
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const raw = await boundedRead(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
    );
    return invoiceSchema.parse(
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)),
    );
  } catch {
    throw new Error(
      "This invoice link could not be opened. Ask the sender for a new link.",
    );
  }
}
