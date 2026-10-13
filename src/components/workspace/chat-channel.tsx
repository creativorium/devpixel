"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { deleteMessage, sendMessage } from "@/app/(workspace)/teams/actions";
import {
  dayLabel,
  initials,
  memberName,
  startsGroup,
  workspaceDay,
  type Channel,
  type Member,
  type Message,
} from "@/lib/workspace/model";
import { parseInline, projectColor } from "@/lib/workspace/note-format";
import LocalTime from "./local-time";

const POLL_MS = 3000;
type Shown = Message & { pending?: boolean; failed?: boolean };

function byCreated(a: Message, b: Message) {
  return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
}

function merge(current: Shown[], incoming: Message[]) {
  const map = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) {
    if (m.deleted_at) map.delete(m.id);
    else map.set(m.id, m);
  }
  return [...map.values()].sort(byCreated);
}

function MessageText({ body }: { body: string }) {
  return body.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {parseInline(line).map((part, j) =>
        part.type === "link" ? (
          <a key={j} href={part.href} target="_blank" rel="noopener noreferrer">
            {part.text}
          </a>
        ) : part.type === "bold" ? (
          <strong key={j}>{part.text}</strong>
        ) : part.type === "italic" ? (
          <em key={j}>{part.text}</em>
        ) : part.type === "code" ? (
          <code key={j}>{part.text}</code>
        ) : (
          <Fragment key={j}>{part.text}</Fragment>
        ),
      )}
    </Fragment>
  ));
}

// Slack-style channel: grouped messages, day dividers, polling for new messages.
export default function ChatChannel({
  channel,
  initial,
  team,
  me,
}: {
  channel: Channel;
  initial: Message[];
  team: Member[];
  me: Member;
}) {
  const [messages, setMessages] = useState<Shown[]>(initial);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const cursor = useRef(
    initial.reduce(
      (max, m) => (m.updated_at > max ? m.updated_at : max),
      "1970-01-01T00:00:00Z",
    ),
  );
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const input = useRef<HTMLTextAreaElement>(null);

  // Poll for new, edited or deleted messages while the tab is visible.
  useEffect(() => {
    let stopped = false;
    async function poll() {
      if (document.hidden) return;
      try {
        const res = await fetch(
          `/teams/api/channels/${channel.id}/messages?since=${encodeURIComponent(cursor.current)}`,
          { cache: "no-store" },
        );
        if (!res.ok || !res.headers.get("content-type")?.includes("json"))
          return;
        const { messages: changes } = (await res.json()) as {
          messages: Message[];
        };
        if (stopped || changes.length === 0) return;
        cursor.current = changes.reduce(
          (max, m) => (m.updated_at > max ? m.updated_at : max),
          cursor.current,
        );
        setMessages((current) => merge(current, changes));
      } catch {
        // Offline or asleep; the next poll catches up.
      }
    }
    const timer = setInterval(poll, POLL_MS);
    const onVisible = () => !document.hidden && poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [channel.id]);

  // Keep the view pinned to the newest message unless the reader scrolled up.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setError("");
    stick.current = true;
    const now = new Date().toISOString();
    const temp: Shown = {
      id: `pending-${now}`,
      channel_id: channel.id,
      author: me.email,
      body,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      pending: true,
    };
    setMessages((current) => [...current, temp]);
    const result = await sendMessage(channel.id, body);
    setMessages((current) =>
      result.ok
        ? merge(
            current.filter((m) => m.id !== temp.id),
            [result.message],
          )
        : current.map((m) =>
            m.id === temp.id ? { ...m, pending: false, failed: true } : m,
          ),
    );
    if (!result.ok) setError(result.message);
    input.current?.focus();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message for everyone?")) return;
    const before = messages;
    setMessages((current) => current.filter((m) => m.id !== id));
    const result = await deleteMessage(id);
    if (!result.ok) {
      setMessages(before);
      setError(result.message);
    }
  }

  const today = workspaceDay(new Date().toISOString());

  return (
    <section className="ws-chat" aria-label={`#${channel.name}`}>
      <header className="ws-chat-head">
        <h1>
          <span aria-hidden="true">#</span>
          {channel.name}
        </h1>
        {channel.topic && <p>{channel.topic}</p>}
      </header>

      <div
        ref={scroller}
        className="ws-chat-scroll"
        role="log"
        aria-live="polite"
        aria-label="Messages"
        onScroll={(event) => {
          const el = event.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {messages.length === 0 ? (
          <div className="ws-chat-empty">
            <strong>Welcome to #{channel.name}</strong>
            <p>This is the start of the channel. Say hello to the team.</p>
          </div>
        ) : (
          messages.map((message, i) => {
            const previous = messages[i - 1];
            const day = workspaceDay(message.created_at);
            const newDay =
              !previous || workspaceDay(previous.created_at) !== day;
            const header = startsGroup(previous, message);
            const name = memberName(team, message.author);
            const mine = message.author === me.email;
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <div className="ws-chat-day" role="separator">
                    <span suppressHydrationWarning>{dayLabel(day, today)}</span>
                  </div>
                )}
                <article
                  className={`ws-msg${header ? " first" : ""}${message.pending ? " pending" : ""}${message.failed ? " failed" : ""}`}
                >
                  <div className="ws-msg-gutter">
                    {header ? (
                      <span
                        className="ws-avatar large"
                        style={{ background: projectColor(message.author) }}
                        aria-hidden="true"
                      >
                        {initials(name)}
                      </span>
                    ) : (
                      <span className="ws-msg-time-hover">
                        <LocalTime
                          iso={message.created_at}
                          options={{ hour: "2-digit", minute: "2-digit" }}
                        />
                      </span>
                    )}
                  </div>
                  <div className="ws-msg-main">
                    {header && (
                      <div className="ws-msg-meta">
                        <strong>{name}</strong>
                        <span className="ws-meta">
                          <LocalTime
                            iso={message.created_at}
                            options={{ hour: "2-digit", minute: "2-digit" }}
                          />
                        </span>
                      </div>
                    )}
                    <div className="ws-msg-body">
                      <MessageText body={message.body} />
                      {message.failed && (
                        <span className="ws-error-text"> · not sent</span>
                      )}
                    </div>
                  </div>
                  {mine && !message.pending && !message.failed && (
                    <button
                      type="button"
                      className="ws-msg-delete"
                      aria-label="Delete message"
                      onClick={() => remove(message.id)}
                    >
                      Delete
                    </button>
                  )}
                </article>
              </Fragment>
            );
          })
        )}
      </div>

      <form
        className="ws-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        {error && (
          <p className="ws-notice error" role="alert">
            {error}
          </p>
        )}
        <div className="ws-composer-box">
          <textarea
            ref={input}
            value={draft}
            rows={1}
            maxLength={4000}
            aria-label={`Message #${channel.name}`}
            placeholder={`Message #${channel.name}`}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="submit"
            className="ws-button small"
            disabled={!draft.trim()}
          >
            Send
          </button>
        </div>
        <p className="ws-meta">
          Enter to send · Shift + Enter for a new line · **bold**, `code` and
          links work
        </p>
      </form>
    </section>
  );
}
