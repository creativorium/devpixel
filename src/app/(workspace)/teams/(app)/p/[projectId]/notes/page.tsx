import Link from "next/link";
import Icon from "@/components/workspace/icons";
import LocalTime from "@/components/workspace/local-time";
import { memberName } from "@/lib/workspace/model";
import { getNotes } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";
import { createNote } from "../../../../actions";

export default async function NotesIndex({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { team } = await requireMember();
  const { projectId } = await params;
  const { error } = await searchParams;
  const notes = await getNotes(projectId);

  return (
    <section aria-label="Pages">
      {error && (
        <p className="ws-notice error" role="alert">
          Could not create the page. Please try again.
        </p>
      )}
      <div className="ws-gallery">
        <form action={createNote.bind(null, projectId)}>
          <button type="submit" className="ws-page-card ws-page-new">
            <Icon name="plus" size={20} />
            New page
          </button>
        </form>
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/teams/p/${projectId}/notes/${note.id}`}
            className="ws-page-card"
          >
            <Icon name="doc" size={20} />
            <strong>{note.title}</strong>
            <span className="ws-meta">
              {memberName(team, note.updated_by)} ·{" "}
              <LocalTime
                iso={note.updated_at}
                options={{ day: "numeric", month: "short" }}
              />
            </span>
          </Link>
        ))}
      </div>
      {notes.length === 0 && (
        <p className="ws-meta" style={{ marginTop: 16 }}>
          Pages are shared with the whole team: briefs, meeting notes, decisions
          and checklists. Never paste passwords; note where they are kept
          instead.
        </p>
      )}
    </section>
  );
}
