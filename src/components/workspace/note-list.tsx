"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LocalTime from "./local-time";
import { memberName, type Member, type Note } from "@/lib/workspace/model";

export default function NoteList({
  notes,
  team,
}: {
  notes: Pick<
    Note,
    "id" | "project_id" | "title" | "updated_by" | "updated_at"
  >[];
  team: Member[];
}) {
  const pathname = usePathname();
  if (notes.length === 0)
    return (
      <p className="ws-meta" style={{ padding: 12 }}>
        No notes yet.
      </p>
    );
  return notes.map((note) => {
    const href = `/teams/p/${note.project_id}/notes/${note.id}`;
    return (
      <Link
        key={note.id}
        href={href}
        className="ws-note-link"
        aria-current={pathname === href ? "page" : undefined}
      >
        {note.title}
        <small>
          {memberName(team, note.updated_by)} ·{" "}
          <LocalTime
            iso={note.updated_at}
            options={{ day: "numeric", month: "short" }}
          />
        </small>
      </Link>
    );
  });
}
