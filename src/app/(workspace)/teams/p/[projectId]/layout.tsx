import { notFound } from "next/navigation";
import ArchiveButton from "@/components/workspace/archive-button";
import ProjectTabs from "@/components/workspace/project-tabs";
import WorkspaceHeader from "@/components/workspace/workspace-header";
import { getProject } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { me } = await requireMember();
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  return (
    <>
      <WorkspaceHeader me={me} project={project} />
      <main className="ws-main">
        <div className="ws-project-head">
          <div>
            <h1 className="ws-title">{project.name}</h1>
            {project.archived_at ? (
              <p className="ws-meta">Archived project</p>
            ) : (
              project.description && <p>{project.description}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <ProjectTabs projectId={project.id} />
            <ArchiveButton
              projectId={project.id}
              archived={Boolean(project.archived_at)}
            />
          </div>
        </div>
        {children}
      </main>
    </>
  );
}
