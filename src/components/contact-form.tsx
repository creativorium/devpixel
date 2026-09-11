"use client";
import { useLanguage } from "./use-language";
import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/services";
import { budgets } from "@/lib/contact";
export function ContactForm({ enabled = false }: { enabled?: boolean }) {
  const { t, locale, href } = useLanguage();
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
        setStatus(t.sending);
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            signal: AbortSignal.timeout(18000),
          });
          const result = await response.json();
          setStatus(
            locale !== "en"
              ? response.ok
                ? t.sent
                : t.failed
              : typeof result.message === "string"
                ? result.message
                : "Something went wrong. Please email code@devnpixel.com.",
          );
          if (response.ok) form.reset();
        } catch {
          setStatus(t.failed);
        } finally {
          setSending(false);
        }
      }}
    >
      <div className="field-row">
        <label>
          {t.name}
          <input
            name="name"
            autoComplete="name"
            placeholder={t.name}
            required
            maxLength={100}
          />
        </label>
        <label>
          {t.email}
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
          {t.need}
          <select name="service" ref={serviceSelect}>
            <option value="Web design & development">{t.combined}</option>
            {services.map((s, i) => (
              <option key={s.slug} value={s.name}>
                {t.serviceNames[i]}
              </option>
            ))}
            <option value="Something else">{t.other}</option>
          </select>
        </label>
        <label>
          {t.budget}
          <select name="budget">
            {budgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget.includes("discuss")
                  ? t.discuss
                  : locale !== "en" && budget.startsWith("Under")
                    ? "< $2,000"
                    : budget}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {t.message}
        <textarea
          name="message"
          placeholder={t.message}
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
        {sending ? t.sending : t.send} <span>↗</span>
      </button>
      <p className="form-status" role="status">
        {status || (enabled ? t.formNote : t.formOffline)}
      </p>
      <p className="form-privacy">
        <a href={href("/privacy")}>{t.privacy}</a>
      </p>
    </form>
  );
}
