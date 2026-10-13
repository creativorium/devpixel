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
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { team } = await requireMember();
  const { projectId } = await params;
  const { task } = await searchParams;
  const tasks = await getTasks(projectId);
  return (
    <KanbanBoard
      projectId={projectId}
      tasks={tasks}
      team={team}
      openTaskId={task ?? null}
    />
  );
}
