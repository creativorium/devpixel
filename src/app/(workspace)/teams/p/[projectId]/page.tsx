import type { Metadata } from "next";
import KanbanBoard from "@/components/workspace/kanban-board";
import { getProject, getTasks } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const project = await getProject((await params).projectId);
  return { title: project?.name ?? "Project" };
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { team } = await requireMember();
  const { projectId } = await params;
  const tasks = await getTasks(projectId);
  return <KanbanBoard projectId={projectId} tasks={tasks} team={team} />;
}
