import { invoiceIdPattern, loadInvoice } from "@/lib/invoice-store";
import { allowInvoiceRequest } from "@/lib/invoice-rate-limit";
export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
};
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!invoiceIdPattern.test(id))
    return Response.json(
      { message: "Invoice unavailable." },
      { status: 404, headers },
    );
  if (!allowInvoiceRequest(_request))
    return Response.json(
      { message: "Please wait a minute before trying again." },
      { status: 429, headers: { ...headers, "Retry-After": "60" } },
    );
  try {
    const invoice = await loadInvoice(id);
    return Response.json(
      invoice
        ? { invoice }
        : {
            message:
              "Invoice unavailable. It may have been removed or revoked.",
          },
      { status: invoice ? 200 : 404, headers },
    );
  } catch {
    return Response.json(
      {
        message:
          "Invoice temporarily unavailable. Please try again later or contact the sender.",
      },
      { status: 503, headers },
    );
  }
}
