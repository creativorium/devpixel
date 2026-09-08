"use client";
import Link from "next/link";
import { useState } from "react";
import { PixelMark } from "./brand";
import { services } from "@/lib/services";
export function ServiceTicker() {
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
              {services.map((service) => (
                <Link
                  href={`/services/${service.slug}`}
                  key={service.slug}
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  {service.name}
                  <PixelMark />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        className="ticker-toggle"
        aria-label={paused ? "Resume service ticker" : "Pause service ticker"}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? "▶" : "Ⅱ"}
      </button>
    </div>
  );
}
