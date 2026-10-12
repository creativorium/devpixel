import Link from "next/link";
import { signOut } from "@/app/(workspace)/teams/login/actions";
import { initials, type Member } from "@/lib/workspace/model";

export default function WorkspaceHeader({
  me,
  project,
}: {
  me: Member;
  project?: { id: string; name: string };
}) {
  const name = me.display_name || me.email;
  return (
    <header className="ws-header">
      <Link href="/teams" className="ws-brand">
        DevnPixel <span>Teams</span>
      </Link>
      <nav className="ws-crumbs" aria-label="Breadcrumb">
        <Link href="/teams">Projects</Link>
        {project && (
          <>
            <span aria-hidden="true">/</span>
            <strong>{project.name}</strong>
          </>
        )}
      </nav>
      <div className="ws-me">
        <span className="ws-avatar" aria-hidden="true">
          {initials(name)}
        </span>
        <span className="ws-me-name">{name}</span>
        <form action={signOut}>
          <button type="submit" className="ws-button ghost small">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
