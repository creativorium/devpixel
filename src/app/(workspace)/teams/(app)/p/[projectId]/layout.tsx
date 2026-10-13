import Link from "next/link";
import { notFound } from "next/navigation";
import ArchiveButton from "@/components/workspace/archive-button";
import ResourceVisibility from "@/components/workspace/resource-visibility";
import { requireMember } from "@/lib/workspace/session";
import { isAdmin } from "@/lib/workspace/model";
import ProjectTabs from "@/components/workspace/project-tabs";
import { projectColor } from "@/lib/workspace/note-format";
import { getProject } from "@/lib/workspace/queries";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { me } = await requireMember();
  const project = await getProject(projectId);
  if (!project) notFound();

  return (
    <div className="ws-page">
      <header className="ws-page-head">
        <div className="ws-project-title">
          <nav className="ws-crumbs" aria-label="Breadcrumb">
            <Link href="/teams">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Projects</span>
          </nav>
          <div className="ws-project-heading-row">
            <h1 className="ws-title">
              <span
                className="ws-project-dot large"
                style={{ background: projectColor(project.id) }}
                aria-hidden="true"
              />
              {project.name}
            </h1>
            {isAdmin(me) && (
              <div className="ws-resource-actions">
                <ResourceVisibility kind="project" id={project.id} />
                <ArchiveButton
                  projectId={project.id}
                  archived={Boolean(project.archived_at)}
                />
              </div>
            )}
          </div>
          {project.archived_at ? (
            <p className="ws-meta">Archived project</p>
          ) : (
            project.description && (
              <p className="ws-lede">{project.description}</p>
            )
          )}
        </div>
      </header>
      <ProjectTabs projectId={project.id} />
      {children}
    </div>
  );
}
