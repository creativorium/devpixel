import type { Metadata } from "next";
import TaskCalendar from "@/components/workspace/task-calendar";
import { parseMonth } from "@/lib/workspace/insights";
import { workspaceToday } from "@/lib/workspace/model";
import { getProject, getTasks } from "@/lib/workspace/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const project = await getProject((await params).projectId);
  return { title: `${project?.name ?? "Project"} · Calendar` };
}

export default async function ProjectCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  const { projectId } = await params;
  const month = parseMonth((await searchParams).m, workspaceToday());
  const tasks = await getTasks(projectId);
  return (
    <TaskCalendar
      tasks={tasks}
      month={month}
      basePath={`/teams/p/${projectId}/calendar`}
    />
  );
}
