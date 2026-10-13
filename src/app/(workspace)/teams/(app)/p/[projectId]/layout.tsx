import Link from "next/link";
import { notFound } from "next/navigation";
import ArchiveButton from "@/components/workspace/archive-button";
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
          <h1 className="ws-title">
            <span
              className="ws-project-dot large"
              style={{ background: projectColor(project.id) }}
              aria-hidden="true"
            />
            {project.name}
          </h1>
          {project.archived_at ? (
            <p className="ws-meta">Archived project</p>
          ) : (
            project.description && (
              <p className="ws-lede">{project.description}</p>
            )
          )}
        </div>
        <ArchiveButton
          projectId={project.id}
          archived={Boolean(project.archived_at)}
        />
      </header>
      <ProjectTabs projectId={project.id} />
      {children}
    </div>
  );
}
