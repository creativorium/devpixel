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
          <h1>Invoice</h1>
        </div>
        {data && (
          <button className="button dark" onClick={() => window.print()}>
            Print / Save PDF ↗
          </button>
        )}
      </div>
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
