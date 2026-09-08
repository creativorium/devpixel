import { z } from "zod";
const text = z.string().max(5000);
const amount = z.number().finite().min(0).max(1e12);
const percent = z.number().finite().min(0).max(100);
export const itemSchema = z.object({
  id: z.string().max(100),
  description: text,
  subDescription: text.default(""),
  quantity: z.number().finite().min(0).max(100000),
  unit: z.enum(["qty", "hrs", "fixed"]),
  rate: amount,
  discount: percent,
});
export const invoiceSchema = z.object({
  version: z.literal(1),
  number: text,
  project: text,
  issued: z.iso.date(),
  due: z.iso.date(),
  currency: z.enum(["IDR", "USD", "EUR", "GBP", "AUD", "SGD"]),
  company: text,
  sender: text,
  email: text,
  address: text,
  client: text,
  clientEmail: text,
  clientAddress: text,
  payment: text,
  notes: text,
  discount: percent,
  tax: percent,
  // Old backups had no switch: preserve their existing tax calculation.
  taxEnabled: z.boolean().default(true),
  items: z.array(itemSchema).min(1).max(100),
});
export type Invoice = z.infer<typeof invoiceSchema>;
export type Item = z.infer<typeof itemSchema>;
export function newInvoice(): Invoice {
  const now = new Date();
  const date = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const due = new Date(now);
  due.setDate(due.getDate() + 14);
  return {
    version: 1,
    number: "DNP-001",
    project: "",
    issued: date(now),
    due: date(due),
    currency: "IDR",
    company: "DevnPixel",
    sender: "",
    email: "",
    address: "",
    client: "",
    clientEmail: "",
    clientAddress: "",
    payment: "",
    notes: "Thank you for your trust. Every pixel counts.",
    discount: 0,
    tax: 0,
    taxEnabled: false,
    items: [
      {
        id: "first",
        description: "Website design & development",
        subDescription: "",
        quantity: 1,
        unit: "qty",
        rate: 0,
        discount: 0,
      },
    ],
  };
}
export function totals(data: Invoice) {
  const scale = data.currency === "IDR" ? 1 : 100;
  const round = (n: number) => Math.round((n + Number.EPSILON) * scale) / scale;
  const lines = data.items.map((i) =>
    round(
      (i.unit === "fixed" ? 1 : i.quantity) * i.rate * (1 - i.discount / 100),
    ),
  );
  const subtotal = round(lines.reduce((a, b) => a + b, 0));
  const discount = round((subtotal * data.discount) / 100);
  const tax = data.taxEnabled
    ? round(((subtotal - discount) * data.tax) / 100)
    : 0;
  return {
    lines,
    subtotal,
    discount,
    tax,
    total: round(subtotal - discount + tax),
  };
}
export function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(n);
}
