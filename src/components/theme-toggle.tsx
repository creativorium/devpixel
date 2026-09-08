"use client";
import { useEffect, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
export function useDarkTheme() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme === "dark",
    () => false,
  );
}
export function ThemeToggle() {
  const dark = useDarkTheme();
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("devnpixel.theme");
      } catch {}
      const value =
        saved === "dark" || saved === "light"
          ? saved
          : media.matches
            ? "dark"
            : "light";
      document.documentElement.dataset.theme = value;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", value === "dark" ? "#171717" : "#f5f5f0");
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return (
    <button
      className="theme-toggle"
      role="switch"
      aria-label="Dark mode"
      aria-checked={dark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const theme = dark ? "light" : "dark";
        document.documentElement.dataset.theme = theme;
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute("content", dark ? "#f5f5f0" : "#171717");
        try {
          localStorage.setItem("devnpixel.theme", theme);
        } catch {}
      }}
    >
      <span aria-hidden="true">{dark ? "☼" : "◐"}</span>
    </button>
  );
}
