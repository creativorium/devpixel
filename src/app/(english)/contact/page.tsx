import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { site } from "@/lib/site";
export const metadata = pageMetadata(
  "Discuss Your Web Design or Development Project",
  "Contact DevnPixel for web design, development and branding. Share your brief and budget for a small-business website in Bali or an international market.",
  "/contact",
);
export default function Contact() {
  return (
    <main id="main" className="section inner-page">
      <p className="eyebrow">EVERY GOOD PROJECT STARTS WITH A CONVERSATION.</p>
      <h1>
        Your next
        <br />
        <span className="pixel-text">big thing.</span> ↗
      </h1>
      <div className="contact-grid">
        <div>
          <h2>
            Let’s build
            <br />
            something good.
          </h2>
          <p>
            A new brand, a better website, or an idea
            <br />
            that doesn’t fit in a box. We’re all ears.
          </p>
          <div className="contact-note">
            <span className="eyebrow">LET’S TALK ABOUT YOUR PROJECT</span>
            <a className="contact-email" href={`mailto:${site.email}`}>
              {site.email} ↗
            </a>
            <p>
              Send a little about your idea, what you need, and when you’d like
              to get started.
            </p>
            <WhatsAppButton />
          </div>
        </div>
        <ContactForm
          enabled={Boolean(
            process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL,
          )}
        />
      </div>
    </main>
  );
}
