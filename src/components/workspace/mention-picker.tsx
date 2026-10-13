"use client";

import { useState } from "react";
import { initials, type Member } from "@/lib/workspace/model";
import { mentionToken } from "@/lib/workspace/insights";
import { projectColor } from "@/lib/workspace/note-format";
import { useTeam } from "./team-context";

type Query = { start: number; text: string };

/** The "@word" being typed right before the caret, if any. */
function activeQuery(value: string, caret: number): Query | null {
  const before = value.slice(0, caret);
  const m = before.match(/(^|\s)@([\p{L}\p{N}._-]{0,30})$/u);
  return m
    ? { start: caret - m[2]!.length - 1, text: m[2]!.toLowerCase() }
    : null;
}

/**
 * Adds Slack-style @mention suggestions to a controlled textarea.
 * Wire `onKeyDown` first in the textarea's handler: it returns true when it consumed the key.
 */
export function useMentionPicker(
  value: string,
  setValue: (next: string) => void,
) {
  const { team } = useTeam();
  const [query, setQuery] = useState<Query | null>(null);
  const [index, setIndex] = useState(0);
  const [field, setField] = useState<HTMLTextAreaElement | null>(null);

  const rank = (m: Member) =>
    (m.display_name || m.email).toLowerCase().startsWith(query!.text) ? 0 : 1;
  const matches = query
    ? team
        .filter((m) =>
          `${m.display_name} ${m.email}`.toLowerCase().includes(query.text),
        )
        .sort((a, b) => rank(a) - rank(b))
    : [];
  const open = matches.length > 0;

  function track(el: HTMLTextAreaElement) {
    setField(el);
    setQuery(activeQuery(el.value, el.selectionStart));
    setIndex(0);
  }

  function pick(member: Member) {
    if (!query || !field) return;
    const caret = field.selectionStart;
    const token = `${mentionToken(member)} `;
    const next = value.slice(0, query.start) + token + value.slice(caret);
    setValue(next);
    setQuery(null);
    const at = query.start + token.length;
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(at, at);
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!open) return false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setIndex((i) => (i + step + matches.length) % matches.length);
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      pick(matches[Math.min(index, matches.length - 1)]!);
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setQuery(null);
      return true;
    }
    return false;
  }

  const popup = open ? (
    <ul
      className="ws-mention-menu"
      role="listbox"
      aria-label="Mention a teammate"
    >
      {matches.map((member, i) => {
        const name = member.display_name || member.email;
        return (
          <li
            key={member.email}
            role="option"
            aria-selected={i === index}
            onMouseDown={(event) => {
              event.preventDefault();
              pick(member);
            }}
            onMouseEnter={() => setIndex(i)}
          >
            <span
              className="ws-avatar"
              style={{ background: projectColor(member.email) }}
              aria-hidden="true"
            >
              {initials(name)}
            </span>
            <strong>{member.display_name || member.email.split("@")[0]}</strong>
            <span className="ws-meta">{member.email}</span>
          </li>
        );
      })}
    </ul>
  ) : null;

  return {
    popup,
    onKeyDown,
    /** Spread onto the textarea alongside your own onChange. */
    fieldProps: {
      onKeyUp: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (
          !["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(
            event.key,
          )
        )
          track(event.currentTarget);
      },
      onClick: (event: React.MouseEvent<HTMLTextAreaElement>) =>
        track(event.currentTarget),
      onInput: (event: React.FormEvent<HTMLTextAreaElement>) =>
        track(event.currentTarget),
      onBlur: () => setQuery(null),
    },
  };
}
