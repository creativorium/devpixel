"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchHit } from "@/app/(workspace)/teams/api/search/route";
import {
  projectStatuses,
  statusDefinition,
  type Channel,
} from "@/lib/workspace/model";
import type { SidebarProject } from "@/lib/workspace/queries";
import Icon, { type IconName } from "./icons";

type Item = {
  key: string;
  label: string;
  hint?: string;
  icon: IconName;
  href: string;
  dot?: string;
};

// Slack/Plane-style quick switcher: Ctrl/Cmd+K, type, Enter.
export default function CommandPalette({
  projects,
  channels,
  open,
  onOpenChange,
}: {
  projects: SidebarProject[];
  channels: Channel[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Server search for task and page titles (debounced).
  useEffect(() => {
    if (!open || query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/teams/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (res.ok) setHits(((await res.json()) as { hits: SearchHit[] }).hits);
      } catch {
        // aborted or offline
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  const staticItems = useMemo<Item[]>(() => {
    const items: Item[] = [
      { key: "home", label: "Home", icon: "home", href: "/teams" },
      {
        key: "dash",
        label: "Dashboard",
        icon: "chart",
        href: "/teams/dashboard",
      },
      {
        key: "cal",
        label: "Calendar",
        icon: "calendar",
        href: "/teams/calendar",
      },
      {
        key: "me",
        label: "Your profile",
        icon: "user",
        href: "/teams/settings",
      },
    ];
    for (const p of projects.filter((x) => !x.archived_at)) {
      const base = `/teams/p/${p.id}`;
      items.push(
        {
          key: `p-${p.id}`,
          label: p.name,
          hint: "Board",
          icon: "board",
          href: base,
        },
        {
          key: `pl-${p.id}`,
          label: p.name,
          hint: "List",
          icon: "list",
          href: `${base}/list`,
        },
        {
          key: `pc-${p.id}`,
          label: p.name,
          hint: "Calendar",
          icon: "calendar",
          href: `${base}/calendar`,
        },
        {
          key: `po-${p.id}`,
          label: p.name,
          hint: "Overview",
          icon: "overview",
          href: `${base}/overview`,
        },
        {
          key: `pn-${p.id}`,
          label: p.name,
          hint: "Notes",
          icon: "notes",
          href: `${base}/notes`,
        },
      );
      for (const n of p.notes)
        items.push({
          key: `n-${n.id}`,
          label: n.title,
          hint: `Page in ${p.name}`,
          icon: "doc",
          href: `${base}/notes/${n.id}`,
        });
    }
    for (const c of channels)
      items.push({
        key: `c-${c.id}`,
        label: `#${c.name}`,
        hint: "Channel",
        icon: "notes",
        href: `/teams/c/${c.id}`,
      });
    return items;
  }, [projects, channels]);

  const q = query.trim().toLowerCase();
  const results: Item[] = useMemo(() => {
    const words = q.split(/\s+/).filter(Boolean);
    const local = staticItems.filter((item) => {
      const text = `${item.label} ${item.hint ?? ""}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
    // Without a query, show the essentials (nav + project boards + channels).
    const shown = q
      ? local
      : local.filter(
          (i) => !i.hint || i.hint === "Board" || i.hint === "Channel",
        );
    const known = new Set(shown.map((i) => i.key));
    const remote: Item[] =
      q.length >= 2
        ? hits
            .map((h): Item =>
              h.kind === "task"
                ? {
                    key: `t-${h.id}`,
                    label: h.title,
                    hint: `Task in ${h.project}`,
                    icon: "check",
                    href: `/teams/p/${h.projectId}?task=${h.id}`,
                    dot: statusDefinition(
                      h.status,
                      projectStatuses(
                        projects.find((p) => p.id === h.projectId),
                      ),
                    ).color,
                  }
                : {
                    key: `n-${h.id}`,
                    label: h.title,
                    hint: `Page in ${h.project}`,
                    icon: "doc",
                    href: `/teams/p/${h.projectId}/notes/${h.id}`,
                  },
            )
            .filter((i) => !known.has(i.key))
        : [];
    return [...shown.slice(0, 30), ...remote];
  }, [q, staticItems, hits, projects]);

  function go(item: Item | undefined) {
    if (!item) return;
    onOpenChange(false);
    setQuery("");
    router.push(item.href);
  }

  if (!open) return null;
  const active = Math.min(index, Math.max(0, results.length - 1));
  return (
    <div
      className="ws-palette-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onOpenChange(false)
      }
    >
      <div
        className="ws-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Go to"
      >
        <div className="ws-palette-input">
          <Icon name="search" size={18} />
          <input
            autoFocus
            value={query}
            placeholder="Jump to a project, page, channel or task…"
            aria-label="Search"
            aria-controls="ws-palette-list"
            aria-activedescendant={
              results[active] ? `ws-pal-${results[active]!.key}` : undefined
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
              if (event.target.value.trim().length < 2) setHits([]);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") onOpenChange(false);
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const step = event.key === "ArrowDown" ? 1 : -1;
                const next =
                  (active + step + results.length) %
                  Math.max(1, results.length);
                setIndex(next);
                list.current
                  ?.querySelector(`[data-index="${next}"]`)
                  ?.scrollIntoView({ block: "nearest" });
              }
              if (event.key === "Enter") {
                event.preventDefault();
                go(results[active]);
              }
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul
          id="ws-palette-list"
          ref={list}
          className="ws-palette-list"
          role="listbox"
        >
          {results.length === 0 && (
            <li className="ws-palette-empty">
              {q.length >= 2 ? "No matches yet…" : "Type to search"}
            </li>
          )}
          {results.map((item, i) => (
            <li
              key={item.key}
              id={`ws-pal-${item.key}`}
              role="option"
              aria-selected={i === active}
              data-index={i}
              onMouseEnter={() => setIndex(i)}
              onMouseDown={(event) => {
                event.preventDefault();
                go(item);
              }}
            >
              {item.dot ? (
                <span
                  className="ws-dot"
                  style={{ background: item.dot }}
                  aria-hidden="true"
                />
              ) : (
                <Icon name={item.icon} />
              )}
              <span className="ws-ellipsis">{item.label}</span>
              {item.hint && <span className="ws-meta">{item.hint}</span>}
            </li>
          ))}
        </ul>
        <div className="ws-palette-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>Enter</kbd> to open
          </span>
          <span>
            <kbd>N</kbd> new task on a board
          </span>
        </div>
      </div>
    </div>
  );
}
