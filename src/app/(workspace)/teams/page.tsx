import type { Metadata } from "next";
import Link from "next/link";
import ArchiveButton from "@/components/workspace/archive-button";
import WorkspaceHeader from "@/components/workspace/workspace-header";
import { statuses, type Project, type TaskStatus } from "@/lib/workspace/model";
import { requireMember } from "@/lib/workspace/session";
import { createProject } from "./actions";

export const metadata: Metadata = { title: "Projects" };

type ProjectRow = Project & { tasks: { status: TaskStatus }[] };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, me } = await requireMember();
  const { error } = await searchParams;
  const { data } = await supabase
    .from("projects")
    .select("*, tasks(status)")
    .order("created_at", { ascending: false });
  const projects = (data ?? []) as ProjectRow[];
  const active = projects.filter((p) => !p.archived_at);
  const archived = projects.filter((p) => p.archived_at);

  return (
    <>
      <WorkspaceHeader me={me} />
      <main className="ws-main">
        <div className="ws-projects-head">
          <div>
            <h1 className="ws-title">Projects</h1>
            <p className="ws-lede">
              Every board and note here is shared with the whole team.
            </p>
          </div>
        </div>
        {error && (
          <p
            className="ws-notice error"
            role="alert"
            style={{ marginBottom: 16 }}
          >
            Could not create the project. Names need 1–120 characters.
          </p>
        )}
        <div className="ws-grid">
          <form action={createProject} className="ws-new-project">
            <label className="ws-field">
              New project
              <input
                className="ws-input"
                name="name"
                placeholder="e.g. Villa Bumi website"
                required
                maxLength={120}
              />
            </label>
            <label className="ws-field">
              Short description (optional)
              <textarea
                className="ws-input"
                name="description"
                rows={2}
                maxLength={2000}
              />
            </label>
            <button type="submit" className="ws-button">
              Create project
            </button>
          </form>
          {active.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {active.length === 0 && (
          <p className="ws-empty" style={{ marginTop: 16 }}>
            No projects yet. Create the first one to get a board and notes.
          </p>
        )}
        {archived.length > 0 && (
          <details className="ws-archived">
            <summary>Archived projects ({archived.length})</summary>
            <ul>
              {archived.map((p) => (
                <li key={p.id}>
                  <Link href={`/teams/p/${p.id}`}>{p.name}</Link>
                  <ArchiveButton projectId={p.id} archived />
                </li>
              ))}
            </ul>
          </details>
        )}
      </main>
    </>
  );
}

function ProjectCard({ project }: { project: ProjectRow }) {
  const total = project.tasks.length;
  const count = (status: TaskStatus) =>
    project.tasks.filter((t) => t.status === status).length;
  const done = count("done");
  return (
    <Link href={`/teams/p/${project.id}`} className="ws-card">
      <h2>{project.name}</h2>
      {project.description && <p>{project.description}</p>}
      <div
        className="ws-progress"
        role="img"
        aria-label={`${done} of ${total} tasks done`}
      >
        {statuses
          .filter((s) => s.id !== "todo")
          .toReversed()
          .map((s) => (
            <span
              key={s.id}
              className={s.id}
              style={{ width: total ? `${(count(s.id) / total) * 100}%` : 0 }}
            />
          ))}
      </div>
      <span className="ws-meta">
        {total === 0
          ? "No tasks yet"
          : `${done}/${total} done · ${count("in_progress")} in progress · ${count("review")} in review`}
      </span>
    </Link>
  );
}
