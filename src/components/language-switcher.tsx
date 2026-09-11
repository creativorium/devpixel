"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  locales,
  languageNames,
  localizedPath,
  originalPath,
} from "@/lib/i18n";
import { useLanguage } from "./use-language";
export function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale, t } = useLanguage();
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return (
    <details
      className="language-switcher"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current) {
          e.stopPropagation();
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary aria-label={t.language}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        <span>{locale.toUpperCase()}</span>
      </summary>
      <div className="language-options">
        {locales.map((lang) => (
          <a
            key={lang}
            href={localizedPath(
              /^\/(invoice|threedanimation)/.test(originalPath(pathname))
                ? "/"
                : pathname,
              lang,
            )}
            lang={lang === "zh" ? "zh-Hans" : lang}
            hrefLang={lang === "zh" ? "zh-Hans" : lang}
            aria-current={lang === locale ? "true" : undefined}
            onClick={(e) => {
              const destination = new URL(e.currentTarget.href);
              destination.search = window.location.search;
              destination.hash = window.location.hash;
              e.currentTarget.href = destination.href;
            }}
          >
            {languageNames[lang]}
          </a>
        ))}
      </div>
    </details>
  );
}
