"use client";
import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/services";
import { budgets } from "@/lib/contact";
export function ContactForm({ enabled = false }: { enabled?: boolean }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const serviceSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("service");
    const service = services.find((s) => s.slug === slug);
    if (service && serviceSelect.current)
      serviceSelect.current.value = service.name;
  }, []);
  return (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!enabled || sending) return;
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        setSending(true);
        setStatus("Sending your enquiry…");
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            signal: AbortSignal.timeout(18000),
          });
          const result = await response.json();
          setStatus(
            typeof result.message === "string"
              ? result.message
              : "Something went wrong. Please email code@devnpixel.com.",
          );
          if (response.ok) form.reset();
        } catch {
          setStatus(
            "We could not confirm submission. Please email code@devnpixel.com directly.",
          );
        } finally {
          setSending(false);
        }
      }}
    >
      <div className="field-row">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            placeholder="Alex, for example"
            required
            maxLength={100}
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            maxLength={254}
          />
        </label>
      </div>
      <div className="field-row">
        <label>
          What do you need?
          <select name="service" ref={serviceSelect}>
            <option>Web design & development</option>
            {services.map((s) => (
              <option key={s.slug}>{s.name}</option>
            ))}
            <option>Something else</option>
          </select>
        </label>
        <label>
          Budget range
          <select name="budget">
            {budgets.map((budget) => (
              <option key={budget}>{budget}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        A little about your idea
        <textarea
          name="message"
          placeholder="The big idea, the small details, and everything in between."
          required
          minLength={10}
          maxLength={5000}
          rows={5}
        />
      </label>
      <label className="contact-honeypot" aria-hidden="true">
        Leave this field blank
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          maxLength={500}
        />
      </label>
      <button
        className="button dark"
        type="submit"
        disabled={!enabled || sending}
      >
        {sending ? "Sending…" : "Send enquiry"} <span>↗</span>
      </button>
      <p className="form-status" role="status">
        {status ||
          (enabled
            ? "We’ll use your details to respond to your enquiry."
            : "The form is being connected. Please email code@devnpixel.com directly for now.")}
      </p>
    </form>
  );
}
