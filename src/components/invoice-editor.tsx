"use client";
import { useEffect, useRef, useState } from "react";
import {
  invoiceSchema,
  money,
  newInvoice,
  totals,
  type Invoice,
  type Item,
} from "@/lib/invoice";
import { PixelMark } from "./brand";
const storageKey = "devnpixel.invoice.v1";
export function InvoiceEditor() {
  const [data, setData] = useState<Invoice | null>(null);
  const [status, setStatus] = useState(
    "Drafts stay in this browser. Export a backup to keep a copy.",
  );
  const [reset, setReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let initial = newInvoice();
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = invoiceSchema.safeParse(JSON.parse(saved));
        if (parsed.success) initial = parsed.data;
        else
          setStatus(
            "Saved draft could not be restored. Starting a new invoice.",
          );
      }
    } catch {
      setStatus(
        "Browser storage is unavailable. Export a backup before leaving.",
      );
    }
    setData(initial);
  }, []);
  useEffect(() => {
    if (!data) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      setStatus("Draft could not be saved. Please export a JSON backup.");
    }
  }, [data]);
  if (!data)
    return (
      <div className="invoice-loading" role="status">
        Opening your workspace…
      </div>
    );
  const update = <K extends keyof Invoice>(key: K, value: Invoice[K]) =>
    setData({ ...data, [key]: value });
  const updateItem = (id: string, patch: Partial<Item>) =>
    update(
      "items",
      data.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  const sum = totals(data);
  const valid =
    invoiceSchema.safeParse(data).success &&
    !!data.client.trim() &&
    !!data.company.trim() &&
    !!data.number.trim() &&
    data.due >= data.issued &&
    data.items.every((i) => !!i.description.trim());
  const input = (key: keyof Invoice, label: string, type = "text") => (
    <label>
      {label}
      <input
        type={type}
        value={String(data[key])}
        maxLength={type === "text" ? 250 : undefined}
        onChange={(e) => update(key, e.target.value)}
      />
    </label>
  );
  const numeric = (v: string, max = 100) =>
    Math.min(max, Math.max(0, Number(v) || 0));
  return (
    <>
      <div className="invoice-toolbar">
        <span className="local-badge">
          <i /> LOCAL WORKSPACE
        </span>
        <div>
          <button className="button small" onClick={() => setReset(true)}>
            New invoice +
          </button>
          <button
            className="button small"
            onClick={() => file.current?.click()}
          >
            Import JSON ↑
          </button>
          <button
            className="button small"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = `${data.number.replace(/[^a-zA-Z0-9_-]/g, "_") || "invoice"}.json`;
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              setStatus(
                "Backup exported. It contains your invoice details; store it somewhere private.",
              );
            }}
          >
            Export JSON ↓
          </button>
          <button
            className="button small dark"
            onClick={() => {
              if (!valid) {
                setStatus(
                  "Add an invoice number, company, client, item descriptions, and valid dates (due date on or after issue date) before printing.",
                );
                return;
              }
              window.print();
            }}
          >
            Print / Save PDF ↗
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (f.size > 250000) {
              setStatus(
                "File is too large. Use an invoice JSON file under 250 KB.",
              );
              return;
            }
            try {
              const parsed = invoiceSchema.parse(JSON.parse(await f.text()));
              if (
                new Set(parsed.items.map((i) => i.id)).size !==
                parsed.items.length
              )
                throw new Error("Duplicate items");
              setData(parsed);
              setStatus("Invoice imported and saved as your current draft.");
            } catch {
              setStatus(
                "Invalid invoice file. Please use a JSON backup exported by this tool.",
              );
            }
          }}
        />
      </div>
      <p className="invoice-status" role="status">
        {status}
      </p>
      {reset && (
        <div className="reset-prompt" role="alert">
          Replace the current draft? Export a backup first if you want to keep
          it.
          <button
            className="button small dark"
            onClick={() => {
              setData(newInvoice());
              setReset(false);
              setStatus("New invoice created.");
            }}
          >
            Replace draft
          </button>
          <button className="button small" onClick={() => setReset(false)}>
            Cancel
          </button>
        </div>
      )}
      <div className="invoice-workspace">
        <div className="invoice-fields">
          <details open>
            <summary>
              <span>01</span> Invoice details
            </summary>
            <div className="field-row">
              {input("number", "Invoice number")}
              {input("project", "Project name")}
            </div>
            <div className="field-row">
              {input("issued", "Issue date", "date")}
              {input("due", "Due date", "date")}
            </div>
            <label>
              Currency
              <select
                value={data.currency}
                onChange={(e) =>
                  update("currency", e.target.value as Invoice["currency"])
                }
              >
                {["IDR", "USD", "EUR", "GBP", "AUD", "SGD"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </details>
          <details open>
            <summary>
              <span>02</span> From & to
            </summary>
            <div className="field-row">
              {input("company", "Your company")}
              {input("sender", "Your name")}
            </div>
            {input("email", "Your email", "email")}
            {input("address", "Your address")}
            <div className="field-divider" />
            {input("client", "Client / company")}
            {input("clientEmail", "Client email", "email")}
            {input("clientAddress", "Client address")}
          </details>
          <details open>
            <summary>
              <span>03</span> Line items
            </summary>
            {data.items.map((item, index) => (
              <div className="invoice-item" key={item.id}>
                <div className="item-title">
                  <span className="eyebrow">
                    ITEM {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    className="remove-item"
                    aria-label={`Remove item ${index + 1}`}
                    disabled={data.items.length === 1}
                    onClick={() =>
                      update(
                        "items",
                        data.items.filter((i) => i.id !== item.id),
                      )
                    }
                  >
                    Remove ×
                  </button>
                </div>
                <label>
                  Item title
                  <input
                    value={item.description}
                    maxLength={500}
                    onChange={(e) =>
                      updateItem(item.id, { description: e.target.value })
                    }
                  />
                </label>
                <label>
                  Sub-description
                  <textarea
                    rows={3}
                    value={item.subDescription}
                    maxLength={5000}
                    placeholder="Scope, deliverables, or a little more detail…"
                    onChange={(e) =>
                      updateItem(item.id, { subDescription: e.target.value })
                    }
                  />
                </label>
                <div className="field-row">
                  <label>
                    Quantity
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      step="0.25"
                      disabled={item.unit === "fixed"}
                      value={item.unit === "fixed" ? 1 : item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: numeric(e.target.value, 100000),
                        })
                      }
                    />
                  </label>
                  <label>
                    Unit
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.id, {
                          unit: e.target.value as Item["unit"],
                        })
                      }
                    >
                      <option value="qty">Quantity</option>
                      <option value="hrs">Hours</option>
                      <option value="fixed">Fixed fee</option>
                    </select>
                  </label>
                </div>
                <div className="field-row">
                  <label>
                    Rate ({data.currency})
                    <input
                      type="number"
                      min="0"
                      max="1000000000000"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.id, {
                          rate: numeric(e.target.value, 1e12),
                        })
                      }
                    />
                  </label>
                  <label>
                    Item discount (%)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) =>
                        updateItem(item.id, {
                          discount: numeric(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              className="button add-item"
              disabled={data.items.length >= 100}
              onClick={() =>
                update("items", [
                  ...data.items,
                  {
                    id: crypto.randomUUID(),
                    description: "",
                    subDescription: "",
                    quantity: 1,
                    unit: "qty",
                    rate: 0,
                    discount: 0,
                  },
                ])
              }
            >
              + Add line item
            </button>
          </details>
          <details open>
            <summary>
              <span>04</span> Totals & payment
            </summary>
            <label className="tax-toggle">
              <span>Apply tax</span>
              <input
                type="checkbox"
                role="switch"
                checked={data.taxEnabled}
                onChange={(e) => update("taxEnabled", e.target.checked)}
              />
              <span className="tax-toggle-track" aria-hidden="true" />
            </label>
            <div className="field-row">
              <label>
                Invoice discount (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={data.discount}
                  onChange={(e) => update("discount", numeric(e.target.value))}
                />
              </label>
              <label>
                Tax (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={data.tax}
                  disabled={!data.taxEnabled}
                  onChange={(e) => update("tax", numeric(e.target.value))}
                />
              </label>
            </div>
            <label>
              Payment details
              <textarea
                rows={4}
                placeholder="Bank name, account number, account holder…"
                maxLength={5000}
                value={data.payment}
                onChange={(e) => update("payment", e.target.value)}
              />
            </label>
            <label>
              Notes & terms
              <textarea
                rows={3}
                maxLength={5000}
                value={data.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </label>
          </details>
        </div>
        <div className="invoice-preview-area">
          <div className="preview-label">
            <span className="eyebrow">LIVE PREVIEW</span>
            <span>A4 / PORTRAIT</span>
          </div>
          <article className="invoice-paper">
            <div className="paper-head">
              <div className="paper-brand">
                <PixelMark />
                <strong>{data.company || "Your company"}</strong>
              </div>
              <span className="eyebrow">INVOICE</span>
            </div>
            <div className="paper-title">
              <h2>{data.number || "DNP-001"}</h2>
              <p>{data.project || "Your next great project"}</p>
            </div>
            <div className="paper-parties">
              <div>
                <span className="eyebrow">BILLED TO</span>
                <strong>{data.client || "Client name"}</strong>
                <p>
                  {data.clientEmail}
                  <br />
                  {data.clientAddress}
                </p>
              </div>
              <div>
                <span className="eyebrow">FROM</span>
                <strong>{data.sender || data.company}</strong>
                <p>
                  {data.email}
                  <br />
                  {data.address}
                </p>
              </div>
              <div>
                <span className="eyebrow">ISSUED</span>
                <p>{data.issued}</p>
                <span className="eyebrow">DUE DATE</span>
                <p>{data.due}</p>
              </div>
            </div>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((i, n) => (
                  <tr key={i.id}>
                    <td>
                      {i.description || "Item description"}
                      {i.subDescription && (
                        <small className="item-subdescription">
                          {i.subDescription}
                        </small>
                      )}
                      {i.discount > 0 && (
                        <small>{i.discount}% item discount</small>
                      )}
                    </td>
                    <td>
                      {i.unit === "fixed" ? 1 : i.quantity}
                      <small>{i.unit}</small>
                    </td>
                    <td>{money(i.rate, data.currency)}</td>
                    <td>{money(sum.lines[n], data.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="paper-totals">
              <div>
                <span>Subtotal</span>
                <span>{money(sum.subtotal, data.currency)}</span>
              </div>
              {data.discount > 0 && (
                <div>
                  <span>Discount ({data.discount}%)</span>
                  <span>−{money(sum.discount, data.currency)}</span>
                </div>
              )}
              {data.taxEnabled && (
                <div>
                  <span>Tax ({data.tax}%)</span>
                  <span>{money(sum.tax, data.currency)}</span>
                </div>
              )}
              <div className="grand-total">
                <span>Total due</span>
                <strong>{money(sum.total, data.currency)}</strong>
              </div>
            </div>
            <div className="paper-notes">
              {data.payment && (
                <div>
                  <span className="eyebrow">PAYMENT DETAILS</span>
                  <p>{data.payment}</p>
                </div>
              )}
              {data.notes && (
                <div>
                  <span className="eyebrow">A LITTLE NOTE</span>
                  <p>{data.notes}</p>
                </div>
              )}
            </div>
            <div className="paper-footer">
              <span>MADE WITH PURPOSE. DOWN TO THE PIXEL.</span>
              <PixelMark />
            </div>
          </article>
          <p className="preview-hint">
            Choose “Save as PDF” in your print dialog. Disable browser headers
            and footers for a clean export.
          </p>
        </div>
      </div>
    </>
  );
}
