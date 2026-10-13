"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./icons";

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/teams/p/${projectId}`;
  const tabs: { href: string; label: string; icon: IconName; on: boolean }[] = [
    { href: base, label: "Board", icon: "board", on: pathname === base },
    {
      href: `${base}/list`,
      label: "List",
      icon: "list",
      on: pathname === `${base}/list`,
    },
    {
      href: `${base}/notes`,
      label: "Notes",
      icon: "notes",
      on: pathname.startsWith(`${base}/notes`),
    },
  ];
  return (
    <nav className="ws-views" aria-label="Project views">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.on ? "page" : undefined}
        >
          <Icon name={tab.icon} /> {tab.label}
        </Link>
      ))}
    </nav>
  );
}
