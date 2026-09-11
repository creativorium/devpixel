import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Terms for using the DevnPixel website and enquiring about our creative services.",
  alternates: pageMetadata("", "", "/terms").alternates,
};
export default function Terms() {
  return (
    <main id="main" className="section inner-page legal-page">
      <p className="eyebrow">THE DETAILS / UPDATED 9 SEPTEMBER 2026</p>
      <h1>
        Terms of <span className="pixel-text">use.</span>
      </h1>
      <p>
        These terms describe permitted use of devnpixel.com, operated as
        DevnPixel, an independent creative studio. Questions can be sent to{" "}
        <a href="mailto:code@devnpixel.com">code@devnpixel.com</a>.
      </p>
      <section>
        <h2>01 / Using this website</h2>
        <p>
          You may browse our work and contact us about legitimate projects. Do
          not misuse forms, submit unlawful content, impersonate someone,
          interfere with the website, or attempt unauthorised access. We may
          limit access where reasonably necessary to protect the site or its
          users.
        </p>
      </section>
      <section>
        <h2>02 / Enquiries and project agreements</h2>
        <p>
          Sending an enquiry does not book a project or create an obligation to
          provide services. Scope, fees, payment milestones, timelines,
          revisions, cancellation, confidentiality, and ownership of
          deliverables must be agreed separately in writing. A signed project
          agreement governs those services and takes precedence over these
          general website terms if they conflict.
        </p>
      </section>
      <section>
        <h2>03 / Creative work and ownership</h2>
        <p>
          Website designs, branding, text, and artwork belong to DevnPixel or
          their respective rights holders unless stated otherwise. Browsing the
          site does not grant a licence to reproduce or commercially use that
          work. Portfolio entries identified as concepts are explorations, not
          claims of completed client engagements. You remain responsible for
          having permission to share materials you send us.
        </p>
      </section>
      <section>
        <h2>04 / Tools and external services</h2>
        <p>
          Any browser tools are provided for convenience. Check calculations,
          business details, and applicable requirements before relying on
          generated documents, and keep your own backups. They do not provide
          accounting, tax, or legal advice. Links to services such as WhatsApp
          are provided for convenience; those services have their own terms and
          availability.
        </p>
      </section>
      <section>
        <h2>05 / Availability and responsibility</h2>
        <p>
          We aim to keep information accurate and the website available, but
          content may change and interruptions can occur. Website examples do
          not guarantee particular commercial results. To the extent permitted
          by applicable law, we do not warrant uninterrupted or error-free
          operation. Nothing in these terms excludes liability or consumer
          rights that cannot lawfully be excluded.
        </p>
      </section>
      <section>
        <h2>06 / Privacy, changes, and concerns</h2>
        <p>
          Our <Link href="/privacy">privacy policy</Link> explains how website
          enquiries and data are handled. We may update these website terms by
          publishing a revised version and date here; this does not itself
          change an existing signed project agreement. Please contact us first
          with concerns so we can try to resolve them. Applicable mandatory laws
          and rights remain in effect.
        </p>
      </section>
      <Link href="/contact">Contact the studio ↗</Link>
    </main>
  );
}
