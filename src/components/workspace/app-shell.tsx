"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createNote, createProject } from "@/app/(workspace)/teams/actions";
import { signOut } from "@/app/(workspace)/teams/login/actions";
import { initials, type Member } from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import type { SidebarProject } from "@/lib/workspace/queries";
import Icon from "./icons";

// ClickUp-style workspace sidebar with Notion-style page tree under each project.
export default function AppShell({
  me,
  projects,
  children,
}: {
  me: Member;
  projects: SidebarProject[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const close = () => setDrawer(false);
  const active = projects.filter((p) => !p.archived_at);
  const archived = projects.filter((p) => p.archived_at);
  const name = me.display_name || me.email;

  return (
    <div className="ws-app" data-drawer={drawer ? "open" : undefined}>
      <header className="ws-mobilebar">
        <button
          type="button"
          className="ws-icon-button"
          aria-label="Open navigation"
          aria-expanded={drawer}
          aria-controls="ws-sidebar"
          onClick={() => setDrawer(true)}
        >
          <Icon name="menu" size={20} />
        </button>
        <Link href="/teams" className="ws-brand">
          DevnPixel <span>Teams</span>
        </Link>
      </header>
      <div className="ws-scrim" onClick={close} aria-hidden="true" />

      <aside id="ws-sidebar" className="ws-side" aria-label="Workspace">
        <div className="ws-side-top">
          <Link href="/teams" className="ws-workspace" onClick={close}>
            <span className="ws-logo" aria-hidden="true">
              D
            </span>
            <span>
              DevnPixel
              <small>Team workspace</small>
            </span>
          </Link>
          <button
            type="button"
            className="ws-icon-button ws-side-close"
            aria-label="Close navigation"
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="ws-side-scroll">
          <SideLink
            href="/teams"
            icon="home"
            current={pathname === "/teams"}
            onNavigate={close}
          >
            Home
          </SideLink>

          <div className="ws-side-section">
            <span>Projects</span>
            <NewProject />
          </div>
          {active.length === 0 && (
            <p className="ws-side-empty">Create a project with +</p>
          )}
          <ul className="ws-tree">
            {active.map((project) => (
              <ProjectNode
                key={project.id}
                project={project}
                pathname={pathname}
                onNavigate={close}
              />
            ))}
          </ul>

          {archived.length > 0 && (
            <details className="ws-side-archived">
              <summary>
                <Icon name="archive" /> Archived ({archived.length})
              </summary>
              <ul className="ws-tree">
                {archived.map((p) => (
                  <li key={p.id}>
                    <SideLink
                      href={`/teams/p/${p.id}`}
                      current={pathname.startsWith(`/teams/p/${p.id}`)}
                      onNavigate={close}
                    >
                      {p.name}
                    </SideLink>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </nav>

        <div className="ws-side-foot">
          <span className="ws-avatar" aria-hidden="true">
            {initials(name)}
          </span>
          <span className="ws-side-me">{name}</span>
          <form action={signOut}>
            <button type="submit" className="ws-button ghost small">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="ws-content">{children}</div>
    </div>
  );
}

function SideLink({
  href,
  icon,
  current,
  onNavigate,
  children,
  depth = 0,
}: {
  href: string;
  icon?: Parameters<typeof Icon>[0]["name"];
  current: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
  depth?: number;
}) {
  return (
    <Link
      href={href}
      className="ws-side-link"
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      style={{ paddingLeft: 10 + depth * 16 }}
    >
      {icon && <Icon name={icon} />}
      <span className="ws-ellipsis">{children}</span>
    </Link>
  );
}

function ProjectNode({
  project,
  pathname,
  onNavigate,
}: {
  project: SidebarProject;
  pathname: string;
  onNavigate: () => void;
}) {
  const base = `/teams/p/${project.id}`;
  const inside = pathname === base || pathname.startsWith(`${base}/`);
  const [open, setOpen] = useState(inside);
  // Expand when navigating into the project from elsewhere.
  const [wasInside, setWasInside] = useState(inside);
  if (inside !== wasInside) {
    setWasInside(inside);
    if (inside) setOpen(true);
  }

  return (
    <li>
      <div className="ws-project-row">
        <button
          type="button"
          className="ws-caret-button"
          aria-label={`${open ? "Collapse" : "Expand"} ${project.name}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span style={{ transform: open ? "rotate(90deg)" : undefined }}>
            <Icon name="chevron" size={14} />
          </span>
        </button>
        <Link
          href={base}
          className="ws-side-link ws-project-link"
          aria-current={pathname === base ? "page" : undefined}
          onClick={onNavigate}
        >
          <span
            className="ws-project-dot"
            style={{ background: projectColor(project.id) }}
            aria-hidden="true"
          />
          <span className="ws-ellipsis">{project.name}</span>
        </Link>
      </div>
      {open && (
        <ul className="ws-tree">
          <li>
            <SideLink
              href={base}
              icon="board"
              depth={1}
              current={pathname === base}
              onNavigate={onNavigate}
            >
              Board
            </SideLink>
          </li>
          <li>
            <SideLink
              href={`${base}/list`}
              icon="list"
              depth={1}
              current={pathname === `${base}/list`}
              onNavigate={onNavigate}
            >
              List
            </SideLink>
          </li>
          <li>
            <SideLink
              href={`${base}/notes`}
              icon="notes"
              depth={1}
              current={pathname === `${base}/notes`}
              onNavigate={onNavigate}
            >
              Notes
            </SideLink>
          </li>
          {project.notes.map((note) => {
            const href = `${base}/notes/${note.id}`;
            return (
              <li key={note.id}>
                <SideLink
                  href={href}
                  icon="doc"
                  depth={2}
                  current={pathname === href}
                  onNavigate={onNavigate}
                >
                  {note.title}
                </SideLink>
              </li>
            );
          })}
          <li>
            <form action={createNote.bind(null, project.id)}>
              <button
                type="submit"
                className="ws-side-link ws-side-add"
                style={{ paddingLeft: 10 + 2 * 16 }}
              >
                <Icon name="plus" /> New page
              </button>
            </form>
          </li>
        </ul>
      )}
    </li>
  );
}

function NewProject() {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        type="button"
        className="ws-icon-button small"
        aria-label="New project"
        title="New project"
        onClick={() => setOpen(true)}
      >
        <Icon name="plus" size={14} />
      </button>
    );
  return (
    <form
      className="ws-side-new"
      action={async (formData) => {
        setOpen(false);
        await createProject(formData);
      }}
    >
      <input
        className="ws-input"
        name="name"
        aria-label="Project name"
        placeholder="Project name, then Enter"
        maxLength={120}
        required
        autoFocus
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        onBlur={(event) => !event.currentTarget.value && setOpen(false)}
      />
    </form>
  );
}
