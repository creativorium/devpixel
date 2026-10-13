"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createNoteFromText } from "@/app/(workspace)/teams/actions";
import Icon from "./icons";

const MAX_CHARS = 100_000;

// Turns a .txt or .md file into a new page. The file is read in the browser;
// only its text is saved, so no file storage is needed.
export default function ImportNote({ projectId }: { projectId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function importFile(file: File) {
    setError("");
    if (!/\.(txt|md|markdown)$/i.test(file.name)) {
      setError("Choose a .txt or .md file.");
      return;
    }
    if (file.size > MAX_CHARS * 4) {
      setError("That file is too long for a page (100,000 characters max).");
      return;
    }
    setBusy(true);
    const text = (await file.text()).replace(/\r\n?/g, "\n");
    if (text.length > MAX_CHARS) {
      setBusy(false);
      setError("That file is too long for a page (100,000 characters max).");
      return;
    }
    const title =
      file.name.replace(/\.(txt|md|markdown)$/i, "").slice(0, 200) ||
      "Imported note";
    const result = await createNoteFromText(projectId, title, text);
    setBusy(false);
    if (!result.ok) setError(result.message);
    else if (result.id) router.push(`/teams/p/${projectId}/notes/${result.id}`);
  }

  return (
    <div className="ws-import">
      <input
        ref={input}
        type="file"
        accept=".txt,.md,.markdown,text/plain,text/markdown"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void importFile(file);
        }}
      />
      <button
        type="button"
        className="ws-page-card ws-page-new"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <Icon name="upload" size={20} />
        {busy ? "Importing…" : "Import .txt / .md"}
      </button>
      {error && (
        <p className="ws-error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
