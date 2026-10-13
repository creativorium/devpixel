"use client";
import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import {
  projectStatuses,
  statusDefinition,
  type StatusDefinition,
} from "@/lib/workspace/model";
type ProjectStatuses = { id: string; statuses?: StatusDefinition[] };
const Context = createContext<ProjectStatuses[]>([]);
export function StatusProvider({
  projects,
  children,
}: {
  projects: ProjectStatuses[];
  children: React.ReactNode;
}) {
  return <Context value={projects}>{children}</Context>;
}
export function useStatuses(projectId?: string) {
  const projects = useContext(Context);
  const pathname = usePathname();
  const id = projectId ?? pathname.match(/\/teams\/p\/([^/]+)/)?.[1];
  return projectStatuses(projects.find((p) => p.id === id));
}
export function useStatusLookup() {
  const projects = useContext(Context);
  return (id: string, projectId: string) =>
    statusDefinition(
      id,
      projectStatuses(projects.find((p) => p.id === projectId)),
    );
}
