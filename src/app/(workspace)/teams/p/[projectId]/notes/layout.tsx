import NoteList from "@/components/workspace/note-list";
import { getNotes } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";
import { createNote } from "../../../actions";

export default async function NotesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { team } = await requireMember();
  const { projectId } = await params;
  const notes = await getNotes(projectId);
  return (
    <div className="ws-notes">
      <aside className="ws-note-list" aria-label="Project notes">
        <form action={createNote.bind(null, projectId)}>
          <button type="submit" className="ws-button small">
            + New note
          </button>
        </form>
        <NoteList notes={notes} team={team} />
      </aside>
      {children}
    </div>
  );
}
