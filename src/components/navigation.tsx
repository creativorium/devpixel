"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PixelMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";
export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link
        className="brand"
        href="/"
        aria-label="DevnPixel home"
        onClick={() => setOpen(false)}
      >
        <PixelMark />
        devnpixel<span className="brand-dot">®</span>
      </Link>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close −" : "Menu +"}
      </button>
      <nav
        id="main-nav"
        className={open ? "nav open" : "nav"}
        aria-label="Main navigation"
      >
        {[
          ["/", "Home"],
          ["/work", "Work"],
          ["/about", "Studio"],
          ["/services", "Services"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
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
            href="/contact"
            className="nav-contact"
            onClick={() => setOpen(false)}
          >
            Let’s talk <span>↗</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
