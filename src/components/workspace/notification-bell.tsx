"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { markNotificationsRead } from "@/app/(workspace)/teams/actions";
import type { Notification } from "@/app/(workspace)/teams/api/notifications/route";
import { initials, memberName, type Member } from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import Icon from "./icons";
import LocalTime from "./local-time";
import { useRealtime } from "./realtime";
import { InlineText } from "./team-context";

const POLL_MS = 60_000;

const verb: Record<Notification["kind"], string> = {
  direct: "sent you a private message",
  mention: "mentioned you",
  assigned: "assigned you",
  comment: "commented on your task",
};

// Slack/ClickUp-style inbox: @mentions, assignments and comments on your tasks.
export default function NotificationBell({
  me,
  team,
}: {
  me: Member;
  team: Member[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/teams/api/notifications", {
        cache: "no-store",
      });
      if (!res.ok || !res.headers.get("content-type")?.includes("json")) {
        throw new Error("Notifications unavailable");
      }
      const data = (await res.json()) as {
        items: Notification[];
        unread: number;
      };
      setItems(data.items);
      setUnread(data.unread);
      setLoaded(true);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    const timer = setInterval(() => !document.hidden && void load(), POLL_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);
  useRealtime("notifications", `recipient=eq.${me.email}`, () => void load());

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function where(n: Notification) {
    if (n.channel_id) return `/teams/c/${n.channel_id}`;
    if (n.project_id && n.task_id)
      return `/teams/p/${n.project_id}?task=${n.task_id}`;
    return "/teams";
  }

  async function openItem(n: Notification) {
    setOpen(false);
    if (!n.read_at) {
      setItems((list) =>
        list.map((x) =>
          x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x,
        ),
      );
      setUnread((u) => Math.max(0, u - 1));
      void markNotificationsRead([n.id]);
    }
    router.push(where(n));
  }

  async function readAll() {
    setItems((list) =>
      list.map((x) => ({
        ...x,
        read_at: x.read_at ?? new Date().toISOString(),
      })),
    );
    setUnread(0);
    await markNotificationsRead("all");
  }

  return (
    <div className="ws-bell" ref={box}>
      <button
        type="button"
        className="ws-bell-button"
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) void load();
          setOpen(!open);
        }}
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span className="ws-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>
      {open && (
        <div
          className="ws-menu right ws-inbox"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="ws-inbox-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button
                type="button"
                className="ws-inline-link"
                onClick={() => void readAll()}
              >
                Mark all read
              </button>
            )}
          </div>
          {loadError && (
            <p className="ws-inbox-empty" role="status">
              Could not refresh notifications.{' '}
              <button type="button" className="ws-inline-link" onClick={() => void load()}>
                Try again
              </button>
            </p>
          )}
          {!loaded && !loadError && <p className="ws-inbox-empty">Loading notifications…</p>}
          {loaded && !loadError && items.length === 0 ? (
            <p className="ws-inbox-empty">
              You&apos;re all caught up. Mentions, assignments and comments on
              your tasks show up here.
            </p>
          ) : (
            <ul className="ws-inbox-list">
              {items.map((n) => {
                const name = memberName(team, n.actor);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`ws-inbox-item${n.read_at ? "" : " unread"}`}
                      onClick={() => void openItem(n)}
                    >
                      <span
                        className="ws-avatar"
                        style={{ background: projectColor(n.actor) }}
                        aria-hidden="true"
                      >
                        {initials(name)}
                      </span>
                      <span className="ws-inbox-text">
                        <span>
                          <strong>{name}</strong> {verb[n.kind]}
                          {n.channel_id ? " in chat" : ""}
                        </span>
                        {n.preview && (
                          <span className="ws-inbox-preview">
                            <InlineText text={n.preview} />
                          </span>
                        )}
                        <span className="ws-meta">
                          <LocalTime iso={n.created_at} />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
