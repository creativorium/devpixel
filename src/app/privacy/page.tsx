import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How DevnPixel handles enquiries, website data, and your privacy choices.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <main id="main" className="section inner-page legal-page">
      <p className="eyebrow">THE DETAILS / UPDATED 9 SEPTEMBER 2026</p>
      <h1>
        Privacy <span className="pixel-text">policy.</span>
      </h1>
      <p>
        This notice describes how DevnPixel handles personal information through
        devnpixel.com and enquiries about our creative services. For privacy
        questions, contact{" "}
        <a href="mailto:code@devnpixel.com">code@devnpixel.com</a>.
      </p>
      <section>
        <h2>01 / Information we handle</h2>
        <p>
          When you contact us, we receive the name, email address, project
          details, and any other information you choose to share. Our hosting
          and email providers also process technical information needed to
          deliver and protect the service, such as IP addresses, request
          details, and delivery logs. Please avoid sending passwords,
          payment-card details, or sensitive personal information in an enquiry.
        </p>
      </section>
      <section>
        <h2>02 / How we use it</h2>
        <p>
          We use enquiries to respond, discuss potential projects, prepare
          proposals, and manage client relationships. We use technical
          information to operate the website and prevent abuse. Where
          applicable, our grounds for processing include steps requested before
          a contract, performing a contract, legitimate interests in responding
          and securing our services, and legal obligations. We do not sell
          personal information or use the contact form to subscribe you to
          marketing.
        </p>
      </section>
      <section>
        <h2>03 / Service providers and external links</h2>
        <p>
          Vercel hosts the website, Resend delivers contact-form emails, and
          Google Workspace handles our mailbox. These providers process relevant
          information to provide their services and may process it in countries
          other than your own, subject to their contractual and legal
          safeguards. Opening a WhatsApp link takes you to a separate service
          governed by WhatsApp’s privacy terms. We may also disclose information
          where required by law.
        </p>
      </section>
      <section>
        <h2>04 / Browser storage</h2>
        <p>
          The website saves your light or dark theme choice in your browser. The
          invoice tool saves its draft locally in that browser; its invoice
          content is not submitted to us by the tool. Exports and printed copies
          are under your control. You can remove saved preferences and drafts by
          clearing this site’s browser data. The site code does not include
          advertising trackers or analytics cookies; hosting services may
          process operational logs independently.
        </p>
      </section>
      <section>
        <h2>05 / Retention and security</h2>
        <p>
          We retain correspondence for as long as needed to handle the enquiry,
          manage a resulting project, resolve disputes, or meet applicable
          record-keeping obligations. The relevant purpose and legal
          requirements determine retention, rather than an indefinite default.
          Browser drafts remain until you replace or clear them. We use access
          controls and encrypted connections to protect information, but no
          online system can guarantee absolute security.
        </p>
      </section>
      <section>
        <h2>06 / Your choices and rights</h2>
        <p>
          Depending on the law that applies, you may have rights to access,
          correct, delete, or receive a copy of your information, restrict or
          object to processing, or withdraw consent where processing relies on
          it. Email us to make a request; we may need to verify your identity.
          You may also raise a concern with the relevant data-protection
          authority. Changes to this notice will appear here with an updated
          date.
        </p>
      </section>
      <Link href="/contact">Contact the studio ↗</Link>
    </main>
  );
}
