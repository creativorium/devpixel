import { redirect } from "next/navigation";
import { getNotes } from "@/lib/workspace/queries";

export default async function NotesIndex({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [latest] = await getNotes(projectId);
  if (latest && !error) redirect(`/teams/p/${projectId}/notes/${latest.id}`);
  return (
    <div className="ws-note">
      {error ? (
        <p className="ws-notice error" role="alert">
          Could not create the note. Please try again.
        </p>
      ) : (
        <p className="ws-empty">
          Notes are shared with everyone on the team. Use them for briefs,
          meeting notes, credentials locations (never the passwords themselves)
          and decisions.
        </p>
      )}
    </div>
  );
}
