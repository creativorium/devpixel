"use client";
import { useLanguage } from "./use-language";
import Link from "next/link";
import { PixelMark } from "./brand";
export function Footer() {
  const { t, href, locale } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <p className="eyebrow">{t.footerIntro}</p>
          <Link className="footer-cta" href={href("/contact")}>
            {locale === "en" ? (
              <>
                Let’s make
                <br />a little impact.
              </>
            ) : (
              t.footerTitle
            )}{" "}
            <span>↗</span>
          </Link>
        </div>
        <PixelMark className="footer-mark" />
      </div>
      <div className="footer-bottom">
        <div className="legal-links">
          <Link href={href("/privacy")}>{t.privacy}</Link>
          <Link href={href("/terms")}>{t.terms}</Link>
        </div>
        <span>© {new Date().getFullYear()} DevnPixel</span>
        <span>{t.independent}</span>
        <Link href={href("/services")}>{t.services} ↗</Link>
        <Link href={href("/blog")}>{t.journal} ↗</Link>
        <a href="#top">{t.backTop} ↑</a>
      </div>
    </footer>
  );
}
