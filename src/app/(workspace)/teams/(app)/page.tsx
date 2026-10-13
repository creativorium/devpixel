import type { Metadata } from "next";
import Link from "next/link";
import LocalTime from "@/components/workspace/local-time";
import {
  addDays,
  memberName,
  statuses,
  workspaceToday,
  type Project,
  type TaskStatus,
} from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import {
  getMyTasks,
  getRecentNotes,
  type TaskWithProject,
} from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";
import { createProject } from "../actions";

export const metadata: Metadata = { title: "Home" };

type ProjectRow = Project & { tasks: { status: TaskStatus }[] };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, me, team } = await requireMember();
  const { error } = await searchParams;
  const [{ data }, myTasks, recentNotes] = await Promise.all([
    supabase
      .from("projects")
      .select("*, tasks(status)")
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    getMyTasks(me.email),
    getRecentNotes(),
  ]);
  const projects = (data ?? []) as ProjectRow[];
  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  const today = workspaceToday();
  const week = addDays(today, 7);
  const groups: { label: string; tasks: TaskWithProject[] }[] = [
    {
      label: "Overdue",
      tasks: myTasks.filter((t) => t.due_date && t.due_date < today),
    },
    {
      label: "Today & this week",
      tasks: myTasks.filter(
        (t) => t.due_date && t.due_date >= today && t.due_date <= week,
      ),
    },
    {
      label: "Later",
      tasks: myTasks.filter((t) => t.due_date && t.due_date > week),
    },
    { label: "No due date", tasks: myTasks.filter((t) => !t.due_date) },
  ].filter((g) => g.tasks.length > 0);

  return (
    <div className="ws-page">
      <header className="ws-page-head">
        <div>
          <p className="ws-eyebrow">Home</p>
          <h1 className="ws-title">
            Welcome back, {me.display_name || me.email.split("@")[0]}
          </h1>
        </div>
      </header>

      {error && (
        <p className="ws-notice error" role="alert">
          {error === "channel"
            ? "Could not create the channel. Use letters, numbers and dashes (up to 40)."
            : "Could not create the project. Names need 1–120 characters."}
        </p>
      )}

      <div className="ws-home">
        <section className="ws-panel" aria-labelledby="my-tasks">
          <div className="ws-panel-head">
            <h2 id="my-tasks">My tasks</h2>
            <span className="ws-meta">{myTasks.length} open</span>
          </div>
          {groups.length === 0 ? (
            <p className="ws-empty">
              Nothing assigned to you. Open a task and set yourself as the
              assignee to see it here.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="ws-mytask-group">
                <h3 className={group.label === "Overdue" ? "overdue" : ""}>
                  {group.label} <span>{group.tasks.length}</span>
                </h3>
                <ul>
                  {group.tasks.map((task) => {
                    const status = statuses.find((s) => s.id === task.status)!;
                    return (
                      <li key={task.id}>
                        <Link
                          href={`/teams/p/${task.project_id}?task=${task.id}`}
                          className="ws-mytask"
                        >
                          <span
                            className="ws-dot"
                            style={{ background: status.color }}
                            title={status.label}
                          />
                          <span className="ws-ellipsis">{task.title}</span>
                          <span className="ws-mytask-project">
                            {task.projects?.name}
                          </span>
                          {task.due_date && (
                            <span
                              className={`ws-due${task.due_date < today ? " overdue" : ""}`}
                            >
                              <LocalTime
                                iso={task.due_date}
                                options={{ day: "numeric", month: "short" }}
                              />
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>

        <section className="ws-panel" aria-labelledby="recent-notes">
          <div className="ws-panel-head">
            <h2 id="recent-notes">Recently edited pages</h2>
          </div>
          {recentNotes.length === 0 ? (
            <p className="ws-empty">
              No pages yet. Open a project and add a page from the sidebar.
            </p>
          ) : (
            <ul className="ws-recent">
              {recentNotes.map((note) => (
                <li key={note.id}>
                  <Link
                    href={`/teams/p/${note.project_id}/notes/${note.id}`}
                    className="ws-mytask"
                  >
                    <span className="ws-ellipsis">{note.title}</span>
                    <span className="ws-mytask-project">
                      {projectName.get(note.project_id)}
                    </span>
                    <span className="ws-meta">
                      {memberName(team, note.updated_by)} ·{" "}
                      <LocalTime
                        iso={note.updated_at}
                        options={{ day: "numeric", month: "short" }}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="projects-heading" className="ws-home-projects">
        <div className="ws-panel-head">
          <h2 id="projects-heading">Projects</h2>
        </div>
        <div className="ws-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <form action={createProject} className="ws-card ws-new-card">
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
            <input
              className="ws-input"
              name="description"
              aria-label="Short description (optional)"
              placeholder="Short description (optional)"
              maxLength={2000}
            />
            <button type="submit" className="ws-button">
              Create project
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectRow }) {
  const total = project.tasks.length;
  const count = (status: TaskStatus) =>
    project.tasks.filter((t) => t.status === status).length;
  const done = count("done");
  return (
    <Link href={`/teams/p/${project.id}`} className="ws-card">
      <span className="ws-card-title">
        <span
          className="ws-project-dot"
          style={{ background: projectColor(project.id) }}
          aria-hidden="true"
        />
        <h3>{project.name}</h3>
      </span>
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
              style={{
                width: total ? `${(count(s.id) / total) * 100}%` : 0,
                background: s.color,
              }}
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
