"use client";
import { useState, useTransition } from "react";
import { renameTaskTitle } from "@/app/(workspace)/teams/actions";
export default function SubtaskTitle({ id, title, disabled }: { id: string; title: string; disabled: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  function save() {
    if (pending) return;
    start(async () => {
      try {
        const result = await renameTaskTitle(id, value);
        if (!result.ok) { setError(result.message); return; }
        setError(""); setEditing(false);
      } catch { setError("Could not save. Try again."); }
    });
  }
  return <span className="ws-inline-subtask">{editing ? <><input className="ws-input" autoFocus aria-label="Subtask title" value={value} maxLength={200} disabled={pending} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); save(); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setEditing(false); } }} /><button type="button" className="ws-button small" disabled={pending} onClick={save}>{pending ? "Saving…" : "Save"}</button><button type="button" className="ws-button ghost small" disabled={pending} onClick={() => setEditing(false)}>Cancel</button></> : <button type="button" className="ws-subtask-title" title="Rename subtask" disabled={disabled} onClick={() => { setValue(title); setEditing(true); }}>{title}</button>}{error && <span role="alert">{error}</span>}</span>;
}
