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
import { projectColor } from "@/lib/workspace/note-format";
import { ACCEPT, type Attachment } from "@/lib/workspace/files";
import { AttachmentList, namePasted, uploadFile } from "./attachments";
import ChannelHeader from "./channel-header";
import { markRead } from "./read-marks";
import Icon from "./icons";
import LocalTime from "./local-time";
import { useMentionPicker } from "./mention-picker";
import { RichText } from "./team-context";

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
  const mentions = useMentionPicker(draft, setDraft);
  const picker = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<
    { key: string; name: string; attachment?: Attachment }[]
  >([]);
  const [dragging, setDragging] = useState(false);

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

  // Reading the channel clears its unread dot in the sidebar.
  useEffect(() => {
    if (!document.hidden) markRead(channel.id);
  }, [channel.id, messages]);

  // Keep the view pinned to the newest message unless the reader scrolled up.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function addFiles(files: File[]) {
    if (files.length === 0) return;
    setError("");
    for (const original of files) {
      const file = namePasted(original);
      const key = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploads((current) => [...current, { key, name: file.name }]);
      try {
        const attachment = await uploadFile(file, { channelId: channel.id });
        setUploads((current) =>
          current.map((u) => (u.key === key ? { ...u, attachment } : u)),
        );
      } catch (err) {
        setUploads((current) => current.filter((u) => u.key !== key));
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    input.current?.focus();
  }

  const ready = uploads.flatMap((u) => (u.attachment ? [u.attachment] : []));
  const uploading = uploads.some((u) => !u.attachment);

  async function send() {
    const body = draft.trim();
    if ((!body && ready.length === 0) || uploading) return;
    const attachments = ready;
    setDraft("");
    setUploads([]);
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
      attachments,
      pending: true,
    };
    setMessages((current) => [...current, temp]);
    const result = await sendMessage(
      channel.id,
      body,
      attachments.map((a) => a.id),
    );
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
      <ChannelHeader channel={channel} />

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
                      <RichText text={message.body} />
                      <AttachmentList attachments={message.attachments ?? []} />
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
        {uploads.length > 0 && (
          <div className="ws-pending-files" aria-live="polite">
            {uploads.map((u) => (
              <span key={u.key} className="ws-file-chip">
                <span className="ws-ellipsis">
                  {u.attachment ? "📎" : "⏳"} {u.name}
                </span>
                {u.attachment && (
                  <button
                    type="button"
                    aria-label={`Remove ${u.name}`}
                    onClick={() =>
                      setUploads((current) =>
                        current.filter((x) => x.key !== u.key),
                      )
                    }
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
        <div
          className={`ws-composer-box${dragging ? " over" : ""}`}
          onDragOver={(event) => {
            if (!event.dataTransfer.types.includes("Files")) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            if (!event.dataTransfer.files.length) return;
            event.preventDefault();
            setDragging(false);
            void addFiles([...event.dataTransfer.files]);
          }}
        >
          {mentions.popup}
          <input
            ref={picker}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(event) => {
              void addFiles([...(event.target.files ?? [])]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="ws-icon-button"
            aria-label="Attach files"
            title="Attach files (or paste a screenshot)"
            onClick={() => picker.current?.click()}
          >
            <Icon name="clip" size={18} />
          </button>
          <textarea
            onPaste={(event) => {
              const files = [...event.clipboardData.files];
              if (files.length === 0) return;
              event.preventDefault();
              void addFiles(files);
            }}
            ref={input}
            value={draft}
            rows={1}
            maxLength={4000}
            aria-label={`Message #${channel.name}`}
            placeholder={`Message #${channel.name}`}
            {...mentions.fieldProps}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (mentions.onKeyDown(event)) return;
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
            disabled={(!draft.trim() && ready.length === 0) || uploading}
          >
            {uploading ? "Uploading…" : "Send"}
          </button>
        </div>
        <p className="ws-meta">
          Enter to send · Shift + Enter for a new line · @ to mention · paste or
          drop screenshots · **bold**, `code` and links work
        </p>
      </form>
    </section>
  );
}
