import { notFound } from "next/navigation";
import NoteEditor from "@/components/workspace/note-editor";
import { getNote } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export default async function NotePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; noteId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { team } = await requireMember();
  const { projectId, noteId } = await params;
  const note = await getNote(projectId, noteId);
  if (!note) notFound();
  return (
    <NoteEditor
      key={note.id}
      note={note}
      team={team}
      startEditing={(await searchParams).edit === "1"}
    />
  );
}
