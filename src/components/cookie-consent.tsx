"use client";
import { useLanguage } from "./use-language";

import { useEffect, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";

const key = "devnpixel.cookies.v1";
const event = "devnpixel-cookie-choice";
const lifetime = 180 * 24 * 60 * 60 * 1000;
type Choice = "accepted" | "essential" | null;
let memoryChoice: Choice = null;
type AnalyticsWindow = Window & {
  "ga-disable-G-RELL4WL624"?: boolean;
  gtag?: (...args: unknown[]) => void;
};
function readChoice(): Choice {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return saved &&
      Date.now() < saved.expires &&
      ["accepted", "essential"].includes(saved.choice)
      ? saved.choice
      : null;
  } catch {
    return memoryChoice;
  }
}
function stopAnalytics() {
  (window as AnalyticsWindow)["ga-disable-G-RELL4WL624"] = true;
  for (const item of document.cookie.split(";")) {
    const name = item.trim().split("=")[0];
    if (!/^_ga(?:_|$)/.test(name)) continue;
    const domains = ["", location.hostname, ".devnpixel.com"];
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax`;
  }
}
function subscribe(callback: () => void) {
  const sync = () => {
    if (readChoice() !== "accepted" && (window as AnalyticsWindow).gtag) {
      stopAnalytics();
      window.location.reload();
      return;
    }
    callback();
  };
  window.addEventListener("storage", sync);
  window.addEventListener(event, sync);
  return () => {
    window.removeEventListener("storage", sync);
    window.removeEventListener(event, sync);
  };
}
export function CookieConsent() {
  const { t, href } = useLanguage();
  const choice = useSyncExternalStore(subscribe, readChoice, () => null);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (choice !== "accepted") stopAnalytics();
  }, [choice]);
  function save(next: Exclude<Choice, null>) {
    memoryChoice = next;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ choice: next, expires: Date.now() + lifetime }),
      );
    } catch {}
    (window as AnalyticsWindow)["ga-disable-G-RELL4WL624"] =
      next !== "accepted";
    setEditing(false);
    window.dispatchEvent(new Event(event));
  }
  return (
    <>
      {choice === "accepted" && (
        <>
          <Script
            id="google-analytics"
            strategy="afterInteractive"
          >{`window['ga-disable-G-RELL4WL624'] = false;
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
gtag('js', new Date());
gtag('config', 'G-RELL4WL624', {allow_google_signals:false, allow_ad_personalization_signals:false});`}</Script>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-RELL4WL624"
            strategy="afterInteractive"
          />
        </>
      )}
      <div className="cookie-widget">
        {choice === null || editing ? (
          <section className="cookie-panel" aria-labelledby="cookie-title">
            <div className="cookie-heading">
              <h2 id="cookie-title">{t.cookieTitle}</h2>
              {choice && (
                <button aria-label={t.close} onClick={() => setEditing(false)}>
                  ×
                </button>
              )}
            </div>
            <p>
              {t.cookieText}{" "}
              <Link href={href("/privacy") + "#cookies"}>
                {t.cookieDetails}
              </Link>
            </p>
            <div className="cookie-actions">
              <button onClick={() => save("essential")}>{t.essential}</button>
              <button onClick={() => save("accepted")}>{t.accept}</button>
            </div>
          </section>
        ) : (
          <button className="cookie-settings" onClick={() => setEditing(true)}>
            {t.cookieSettings}
          </button>
        )}
      </div>
    </>
  );
}
