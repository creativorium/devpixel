"use client";
import { useEffect, useState } from "react";
import { InvoicePaper } from "./invoice-paper";
import { readInvoiceSnapshot } from "@/lib/invoice-share";
import { invoiceSchema, type Invoice } from "@/lib/invoice";
export function InvoiceSnapshot({ id }: { id?: string }) {
  const [data, setData] = useState<Invoice | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true,
      generation = 0;
    const load = () => {
      const current = ++generation;
      setData(null);
      setError("");
      (id
        ? fetch(`/api/invoices/${encodeURIComponent(id)}`, {
            cache: "no-store",
            referrerPolicy: "no-referrer",
          }).then(async (response) => {
            const body = await response.json();
            if (!response.ok)
              throw new Error(body.message || "Invoice unavailable.");
            return invoiceSchema.parse(body.invoice);
          })
        : readInvoiceSnapshot(window.location.hash)
      )
        .then((invoice) => {
          if (active && current === generation) setData(invoice);
        })
        .catch((e) => {
          if (active && current === generation) setError(e.message);
        });
    };
    load();
    window.addEventListener("hashchange", load);
    return () => {
      active = false;
      window.removeEventListener("hashchange", load);
    };
  }, [id]);
  return (
    <main id="main" className="invoice-page shared-invoice">
      <div className="invoice-heading">
        <div>
          <p className="eyebrow">SHARED INVOICE</p>
          <h1>Invoice snapshot.</h1>
        </div>
        {data && (
          <button className="button dark" onClick={() => window.print()}>
            Print / Save PDF ↗
          </button>
        )}
      </div>
      <p className="invoice-share-info">
        A fixed copy supplied by the sender. This link does not verify the
        sender’s identity or payment status. Confirm payment details directly
        with the sender.
      </p>
      {error ? (
        <p role="alert">{error}</p>
      ) : data ? (
        <InvoicePaper data={data} />
      ) : (
        <p role="status">Opening invoice…</p>
      )}
    </main>
  );
}
