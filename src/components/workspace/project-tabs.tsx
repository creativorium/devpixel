"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/teams/p/${projectId}`;
  const onNotes = pathname.startsWith(`${base}/notes`);
  return (
    <nav className="ws-tabs" aria-label="Project views">
      <Link href={base} aria-current={onNotes ? undefined : "page"}>
        Board
      </Link>
      <Link href={`${base}/notes`} aria-current={onNotes ? "page" : undefined}>
        Notes
      </Link>
    </nav>
  );
}
