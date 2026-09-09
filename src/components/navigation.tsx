"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PixelMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";
export function Navigation() {
  const pathname = usePathname();
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
        href="/"
        aria-label="DevnPixel home"
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
        {open ? "Close −" : "Menu +"}
      </button>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          tabIndex={-1}
        />
      )}
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
