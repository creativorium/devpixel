"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// RLS blocks requests immediately. Also clear an already-open resource after revocation.
export default function AccessMonitor() {
  const pathname = usePathname();
  useEffect(() => {
    const match = pathname.match(/^\/teams\/(p|c)\/([0-9a-f-]{36})(?:\/|$)/i);
    if (!match) return;
    const controller = new AbortController();
    let checking = false;
    async function check() {
      if (document.hidden || checking) return;
      checking = true;
      try {
        const response = await fetch(
          `/teams/api/access?kind=${match![1] === "p" ? "project" : "channel"}&id=${match![2]}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (response.status === 404 && !controller.signal.aborted)
          window.location.replace("/teams");
      } catch {
        /* Retry on the next poll if offline. */
      } finally {
        checking = false;
      }
    }
    void check();
    const timer = setInterval(check, 15000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [pathname]);
  return null;
}
