"use client";

import { useSyncExternalStore } from "react";

// When each chat channel was last read, kept per browser (a convenience, not shared
// state): the sidebar bolds channels with messages newer than this.

const KEY = "ws-channel-read";
const EVENT = "ws-read-change";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

export function markRead(channelId: string, at = new Date().toISOString()) {
  try {
    const marks = JSON.parse(read()) as Record<string, string>;
    if ((marks[channelId] ?? "") >= at) return;
    marks[channelId] = at;
    localStorage.setItem(KEY, JSON.stringify(marks));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // storage blocked: unread dots simply stay off
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Map of channel id → last read ISO time (empty on the server). */
export function useReadMarks(): Record<string, string> {
  const raw = useSyncExternalStore(subscribe, read, () => "{}");
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}
