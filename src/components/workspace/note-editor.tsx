"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteNote, saveNote } from "@/app/(workspace)/teams/actions";
import { memberName, type Member, type Note } from "@/lib/workspace/model";
import {
  parseBlocks,
  todoProgress,
  continueList,
  insertLink,
  togglePrefix,
  toggleTodo,
  toggleWrap,
  type Edit,
} from "@/lib/workspace/note-format";
import Icon, { type IconName } from "./icons";
import LocalTime from "./local-time";
import { useMentionPicker } from "./mention-picker";
import NoteBlocks from "./note-blocks";

const AUTOSAVE_MS = 1200;

type Tool = {
  label: string;
  icon: IconName;
  key?: string;
  keys?: string;
  apply: (text: string, start: number, end: number) => Edit;
};
const tools: Tool[] = [
  {
    label: "Bold",
    icon: "bold",
    key: "b",
    keys: "Ctrl+B",
    apply: (t, s, e) => toggleWrap(t, s, e, "**", "bold text"),
  },
  {
    label: "Italic",
    icon: "italic",
    key: "i",
    keys: "Ctrl+I",
    apply: (t, s, e) => toggleWrap(t, s, e, "_", "italic text"),
  },
  {
    label: "Heading",
    icon: "heading",
    apply: (t, s, e) => togglePrefix(t, s, e, "## "),
  },
  {
    label: "Bulleted list",
    icon: "list",
    apply: (t, s, e) => togglePrefix(t, s, e, "- "),
  },
  {
    label: "To-do",
    icon: "todo",
    apply: (t, s, e) => togglePrefix(t, s, e, "[ ] "),
  },
  {
    label: "Code",
    icon: "code",
    key: "e",
    keys: "Ctrl+E",
    apply: (t, s, e) => toggleWrap(t, s, e, "`", "code"),
  },
  { label: "Link", icon: "link", key: "k", keys: "Ctrl+K", apply: insertLink },
];

// Notion-style page: reads as a formatted document, edits as light Markdown with autosave.
export default function NoteEditor({
  note,
  team,
  startEditing,
}: {
  note: Note;
  team: Member[];
  startEditing: boolean;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [status, setStatus] = useState<"saved" | "dirty" | "saving" | "error">(
    "saved",
  );
  const [message, setMessage] = useState("");
  const [deleting, startDelete] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef({ title, body });
  const mentions = useMentionPicker(body, (next) => edit({ body: next }));
  const area = useRef<HTMLTextAreaElement>(null);

  function applyEdit(next: Edit) {
    edit({ body: next.text });
    requestAnimationFrame(() => {
      area.current?.focus();
      area.current?.setSelectionRange(next.start, next.end);
    });
  }

  function format(apply: (text: string, start: number, end: number) => Edit) {
    const el = area.current;
    if (!el) return;
    applyEdit(apply(el.value, el.selectionStart, el.selectionEnd));
  }

  // While reading, follow the server copy (a teammate may have edited the page).
  const [syncedAt, setSyncedAt] = useState(note.updated_at);
  if (!editing && status === "saved" && note.updated_at !== syncedAt) {
    setSyncedAt(note.updated_at);
    setTitle(note.title);
    setBody(note.body);
  }

  async function save() {
    clearTimeout(timer.current);
    const draft = latest.current;
    if (!draft.title.trim()) {
      setStatus("error");
      setMessage("Give the page a title.");
      return false;
    }
    setStatus("saving");
    const result = await saveNote(note.id, draft.title, draft.body);
    if (!result.ok) {
      setStatus("error");
      setMessage(result.message);
      return false;
    }
    const changedSince =
      latest.current.title !== draft.title ||
      latest.current.body !== draft.body;
    setStatus(changedSince ? "dirty" : "saved");
    setMessage("");
    return true;
  }

  function edit(next: { title?: string; body?: string }, delay = AUTOSAVE_MS) {
    latest.current = { ...latest.current, ...next };
    setTitle(latest.current.title);
    setBody(latest.current.body);
    setStatus("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(save, delay);
  }

  useEffect(() => {
    if (status !== "dirty" && status !== "saving") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const blocks = parseBlocks(body);
  const todos = todoProgress(blocks);
  const statusText = {
    saved: "Saved",
    dirty: "Editing…",
    saving: "Saving…",
    error: message,
  }[status];

  return (
    <article className="ws-doc">
      <div className="ws-doc-bar">
        <span className={status === "error" ? "ws-error-text" : undefined}>
          {editing || status !== "saved" ? (
            statusText
          ) : (
            <>
              Edited by {memberName(team, note.updated_by)} ·{" "}
              <LocalTime iso={note.updated_at} />
            </>
          )}
        </span>
        {todos.total > 0 && (
          <span className="ws-pill">
            {todos.done}/{todos.total} done
          </span>
        )}
        {editing ? (
          <button
            type="button"
            className="ws-button small"
            disabled={status === "saving"}
            onClick={async () => {
              if (status === "saved" || (await save())) setEditing(false);
            }}
          >
            Done
          </button>
        ) : (
          <button
            type="button"
            className="ws-button ghost small"
            onClick={() => {
              latest.current = { title, body };
              setEditing(true);
            }}
          >
            Edit
          </button>
        )}
        <button
          type="button"
          className="ws-button danger small"
          disabled={deleting}
          onClick={() => {
            if (!confirm("Delete this page for everyone?")) return;
            clearTimeout(timer.current);
            startDelete(() => deleteNote(note.id));
          }}
        >
          Delete
        </button>
      </div>

      {editing ? (
        <>
          <input
            className="ws-doc-title"
            aria-label="Page title"
            value={title}
            maxLength={200}
            placeholder="Untitled"
            onChange={(event) => edit({ title: event.target.value })}
          />
          <div
            className="ws-toolbar"
            role="toolbar"
            aria-label="Formatting"
            onMouseDown={(event) => event.preventDefault()}
          >
            {tools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                className="ws-tool"
                title={tool.label + (tool.keys ? ` (${tool.keys})` : "")}
                aria-label={tool.label}
                onClick={() => format(tool.apply)}
              >
                <Icon name={tool.icon} size={16} />
              </button>
            ))}
          </div>
          <textarea
            ref={area}
            className="ws-doc-source"
            aria-label="Page content"
            aria-describedby="ws-format-hint"
            value={body}
            maxLength={100000}
            autoFocus={!startEditing}
            placeholder={"Start writing…\n\n# Heading\n- Bullet\n[ ] To-do"}
            {...mentions.fieldProps}
            onChange={(event) => edit({ body: event.target.value })}
            onKeyDown={(event) => {
              if (mentions.onKeyDown(event)) return;
              const mod = event.ctrlKey || event.metaKey;
              const tool = mod
                ? tools.find((t) => t.key === event.key.toLowerCase())
                : undefined;
              if (tool) {
                event.preventDefault();
                format(tool.apply);
              } else if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !mod &&
                !event.nativeEvent.isComposing
              ) {
                const el = event.currentTarget;
                if (el.selectionStart !== el.selectionEnd) return;
                const next = continueList(el.value, el.selectionStart);
                if (!next) return;
                event.preventDefault();
                applyEdit(next);
              }
            }}
            onBlur={() => {
              mentions.fieldProps.onBlur();
              if (status === "dirty") void save();
            }}
          />
          {mentions.popup}
          <p id="ws-format-hint" className="ws-format-hint">
            <code># </code>heading · <code>## </code>subheading ·{" "}
            <code>- </code>bullet · <code>1. </code>numbered · <code>[ ] </code>
            to-do · <code>@</code> mention · <code>&gt; </code>quote ·{" "}
            <code>---</code> divider · <code>**bold**</code> ·{" "}
            <code>`code`</code> · links
          </p>
        </>
      ) : (
        <>
          <h1
            className="ws-doc-title"
            onDoubleClick={() => {
              latest.current = { title, body };
              setEditing(true);
            }}
          >
            {title}
          </h1>
          {blocks.length ? (
            <NoteBlocks
              blocks={blocks}
              onToggle={(line) => edit({ body: toggleTodo(body, line) }, 300)}
            />
          ) : (
            <button
              type="button"
              className="ws-doc-empty"
              onClick={() => {
                latest.current = { title, body };
                setEditing(true);
              }}
            >
              Empty page. Click to start writing.
            </button>
          )}
        </>
      )}
    </article>
  );
}
