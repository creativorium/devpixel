"use client";
import { useLanguage } from "./use-language";
import { LanguageSwitcher } from "./language-switcher";
import { originalPath } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PixelMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { WhatsAppButton } from "./whatsapp-button";
export function Navigation() {
  const pathname = originalPath(usePathname());
  const { t, href: localHref } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return (
    <header className="site-header">
      <Link
        className="brand"
        href={localHref("/")}
        aria-label={`DevnPixel — ${t.home}`}
        onClick={() => setOpen(false)}
      >
        <PixelMark />
        devnpixel<span className="brand-dot">®</span>
      </Link>
      <button
        ref={menuButton}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? `${t.close} −` : `${t.menu} +`}
      </button>
      {open && (
        <button
          className="nav-backdrop"
          aria-label={t.close}
          onClick={() => setOpen(false)}
          tabIndex={-1}
        />
      )}
      <nav
        id="main-nav"
        className={open ? "nav open" : "nav"}
        aria-label={t.menu}
      >
        <div className="mobile-nav-brand">
          <Link
            href={localHref("/")}
            onClick={() => setOpen(false)}
            aria-label={`DevnPixel — ${t.home}`}
          >
            <PixelMark />
            <span>devnpixel</span>
          </Link>
        </div>
        {[
          ["/", t.home],
          ["/work", t.work],
          ["/about", t.studio],
          ["/services", t.services],
          ["/blog", t.journal],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={localHref(href)}
            aria-current={
              pathname === href ||
              (href !== "/" && pathname.startsWith(`${href}/`))
                ? "page"
                : undefined
            }
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
        <div className="nav-actions">
          <ThemeToggle />
          <Link
            href={localHref("/contact")}
            className="nav-contact"
            onClick={() => setOpen(false)}
          >
            {t.talk} <span>↗</span>
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="mobile-nav-extra">
          <p className="eyebrow">{t.independent}</p>
          <p className="mobile-nav-motto">{t.motto}</p>
          <WhatsAppButton />
          <div className="legal-links">
            <Link href={localHref("/privacy")} onClick={() => setOpen(false)}>
              {t.privacy}
            </Link>
            <Link href={localHref("/terms")} onClick={() => setOpen(false)}>
              {t.terms}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
