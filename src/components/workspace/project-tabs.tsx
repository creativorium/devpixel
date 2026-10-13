"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./icons";

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/teams/p/${projectId}`;
  const view = (path: string, label: string, icon: IconName) => ({
    href: `${base}/${path}`,
    label,
    icon,
    on: pathname === `${base}/${path}`,
  });
  const tabs: { href: string; label: string; icon: IconName; on: boolean }[] = [
    view("overview", "Overview", "overview"),
    { href: base, label: "Board", icon: "board", on: pathname === base },
    view("list", "List", "list"),
    view("calendar", "Calendar", "calendar"),
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
