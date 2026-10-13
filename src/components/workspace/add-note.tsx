"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createNote } from "@/app/(workspace)/teams/actions";
import Icon from "./icons";
import ImportNote from "./import-note";

function NewPageButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="ws-menu-item" disabled={pending}>
      <Icon name="doc" /> {pending ? "Creating…" : "Blank page"}
    </button>
  );
}

export default function AddNote({ projectId }: { projectId: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (details.current && !details.current.contains(event.target as Node))
        details.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <details
      ref={details}
      className="ws-add-page"
      onKeyDown={(event) => {
        if (event.key === "Escape" && details.current?.open) {
          event.preventDefault();
          details.current.open = false;
          trigger.current?.focus();
        }
      }}
    >
      <summary ref={trigger} className="ws-page-card ws-page-new">
        <Icon name="plus" size={20} />
        Add page
      </summary>
      <div className="ws-menu ws-add-page-options">
        <form action={createNote.bind(null, projectId)}>
          <NewPageButton />
        </form>
        <ImportNote projectId={projectId} />
      </div>
    </details>
  );
}
