"use client";
import { useCallback, useSyncExternalStore } from "react";
import { parseProjectOrder } from "@/lib/workspace/project-order";

const eventName = "workspace-project-order";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}
export function useProjectOrder(email: string) {
  const key = `workspace:project-order:${email}`;
  const read = useCallback(() => {
    try {
      return localStorage.getItem(key) ?? "[]";
    } catch {
      return "[]";
    }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  return {
    order: parseProjectOrder(raw),
    save(order: string[]) {
      try {
        localStorage.setItem(key, JSON.stringify(order));
        window.dispatchEvent(new Event(eventName));
        return true;
      } catch {
        return false;
      }
    },
  };
}
