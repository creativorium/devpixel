import type { Metadata } from "next";
import Dashboard from "@/components/workspace/dashboard";
import TimeReport from "@/components/workspace/time-report";
import { dashboardStats } from "@/lib/workspace/insights";
import { workspaceToday, projectStatuses } from "@/lib/workspace/model";
import { getProject, getTasks } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const project = await getProject((await params).projectId);
  return { title: `${project?.name ?? "Project"} · Overview` };
}

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { team } = await requireMember();
  const { projectId } = await params;
  const tasks = await getTasks(projectId);
  const project = await getProject(projectId);
  return (
    <><Dashboard
      stats={dashboardStats(
        tasks,
        team,
        workspaceToday(),
        projectStatuses(project),
      )}
    /><TimeReport projectId={projectId} /></>
  );
}
