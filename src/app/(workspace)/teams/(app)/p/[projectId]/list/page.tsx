import type { Metadata } from "next";
import TaskList from "@/components/workspace/task-list";
import { getProject, getTasks } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const project = await getProject((await params).projectId);
  return { title: `${project?.name ?? "Project"} · List` };
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { team } = await requireMember();
  const { projectId } = await params;
  const tasks = await getTasks(projectId);
  return <TaskList projectId={projectId} tasks={tasks} team={team} />;
}
