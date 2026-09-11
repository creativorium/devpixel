import type { Metadata } from "next";
import { InvoiceEditor } from "@/components/invoice-editor";
export const metadata: Metadata = {
  title: "Invoice studio",
  description:
    "Create and export a clean, pixel-inspired invoice in your browser.",
  robots: { index: false, follow: false },
};
export default function InvoicePage() {
  return (
    <main id="main" className="invoice-page">
      <div className="invoice-heading">
        <div>
          <p className="eyebrow">THE STUDIO TOOLKIT / 001</p>
          <h1>
            Invoice<span className="serif"> studio.</span>
          </h1>
        </div>
        <span className="tiny-label">YOUR WORK. ALL SQUARED UP.</span>
      </div>
      <InvoiceEditor />
    </main>
  );
}
