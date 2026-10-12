"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteNote, saveNote } from "@/app/(workspace)/teams/actions";
import LocalTime from "./local-time";
import { memberName, type Member, type Note } from "@/lib/workspace/model";

const AUTOSAVE_MS = 1500;

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

  async function save() {
    clearTimeout(timer.current);
    const draft = latest.current;
    if (!draft.title.trim()) {
      setStatus("error");
      setMessage("Give the note a title.");
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

  function edit(next: { title?: string; body?: string }) {
    latest.current = { ...latest.current, ...next };
    setTitle(latest.current.title);
    setBody(latest.current.body);
    setStatus("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(save, AUTOSAVE_MS);
  }

  useEffect(() => {
    if (status !== "dirty" && status !== "saving") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);
  useEffect(() => () => clearTimeout(timer.current), []);

  // While reading, always show the latest server copy (a teammate may have edited it).
  const shownTitle = editing ? title : note.title;
  const shownBody = editing ? body : note.body;

  return (
    <article className="ws-note">
      <div className="ws-note-bar">
        <span>
          {editing ? (
            {
              saved: "All changes saved",
              dirty: "Unsaved changes…",
              saving: "Saving…",
              error: message,
            }[status]
          ) : (
            <>
              Last edited by {memberName(team, note.updated_by)} ·{" "}
              <LocalTime iso={note.updated_at} />
            </>
          )}
        </span>
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
            className="ws-button small"
            onClick={() => {
              latest.current = { title: note.title, body: note.body };
              setTitle(note.title);
              setBody(note.body);
              setStatus("saved");
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
            if (!confirm("Delete this note for everyone?")) return;
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
            className="ws-note-title"
            aria-label="Note title"
            value={shownTitle}
            maxLength={200}
            onChange={(event) => edit({ title: event.target.value })}
          />
          <textarea
            className="ws-note-body"
            aria-label="Note"
            value={shownBody}
            maxLength={100000}
            autoFocus={!startEditing}
            placeholder="Write the brief, meeting notes, decisions…"
            onChange={(event) => edit({ body: event.target.value })}
            onBlur={() => status === "dirty" && save()}
          />
        </>
      ) : (
        <>
          <h2 className="ws-note-title">{shownTitle}</h2>
          {shownBody ? (
            <div className="ws-note-read">{shownBody}</div>
          ) : (
            <p className="ws-meta">This note is empty. Select Edit to write.</p>
          )}
        </>
      )}
    </article>
  );
}
