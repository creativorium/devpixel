"use client";
import { useLanguage } from "./use-language";
import Link from "next/link";
import { useState } from "react";
import { PixelMark } from "./brand";
import { services } from "@/lib/services";
export function ServiceTicker() {
  const { t, href } = useLanguage();
  const [paused, setPaused] = useState(false);
  return (
    <div className={`ticker service-ticker ${paused ? "is-paused" : ""}`}>
      <div className="ticker-window">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div
              className="ticker-group"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {services.map((service, i) => (
                <Link
                  href={href(`/services/${service.slug}`)}
                  key={service.slug}
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  {t.serviceNames[i]}
                  <PixelMark />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        className="ticker-toggle"
        aria-label={paused ? t.rotate : t.pause}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? "▶" : "Ⅱ"}
      </button>
    </div>
  );
}
