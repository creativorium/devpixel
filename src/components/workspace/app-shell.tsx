"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  createChannel,
  createNote,
  createProject,
  deleteChannel,
  removeNote,
  renameChannel,
  renameNote,
  renameProject,
  setProjectArchived,
} from "@/app/(workspace)/teams/actions";
import { signOut } from "@/app/(workspace)/teams/login/actions";
import {
  initials,
  isAdmin,
  type Channel,
  type Member,
} from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import type { SidebarProject } from "@/lib/workspace/queries";
import Icon, { type IconName } from "./icons";
import CommandPalette from "./command-palette";
import NotificationBell from "./notification-bell";
import DirectMessages from "./direct-messages";
import { RealtimeProvider } from "./realtime";
import { useReadMarks } from "./read-marks";
import { TeamProvider } from "./team-context";
import { StatusProvider } from "./status-context";
import { PresenceProvider } from "./presence";
import AccessMonitor from "./access-monitor";
import { useProjectOrder } from "./project-order";
import { moveProject, orderedProjects } from "@/lib/workspace/project-order";

type Result = { ok: boolean; message?: string };

// ClickUp-style workspace sidebar with a Notion-style page tree under each project.
// Every item can be renamed in place (double-click or ⋯ → Rename) and removed from ⋯.
export default function AppShell({
  me,
  projects,
  channels,
  team,
  realtime,
  children,
}: {
  me: Member;
  team: Member[];
  projects: SidebarProject[];
  channels: (Channel & { latest?: { created_at: string; author: string }[] })[];
  realtime: { url: string; key: string } | null;
  children: React.ReactNode;
}) {
  const [palette, setPalette] = useState(false);
  const marks = useReadMarks();
  const unread = (channel: (typeof channels)[number]) => {
    const latest = channel.latest?.[0];
    return Boolean(
      latest &&
      latest.author !== me.email &&
      latest.created_at > (marks[channel.id] ?? "") &&
      pathname !== `/teams/c/${channel.id}`,
    );
  };
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!drawer) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current
      ?.querySelector<HTMLButtonElement>(".ws-side-close")
      ?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setDrawer(false);
    };
    const desktop = window.matchMedia("(min-width: 901px)");
    const onResize = () => {
      if (desktop.matches) setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      previousFocus?.focus();
    };
  }, [drawer]);
  const [error, setError] = useState("");
  const [, start] = useTransition();
  // Optimistic names/removals so the sidebar reacts instantly.
  const [names, setNames] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const close = () => setDrawer(false);
  const admin = isAdmin(me);
  const projectOrder = useProjectOrder(me.email);
  const active = orderedProjects(
    projects.filter((p) => !p.archived_at && !hidden.has(p.id)),
    projectOrder.order,
  );
  const [dragProject, setDragProject] = useState<string | null>(null);
  function reorderProject(id: string, target: string, after = false) {
    setError("");
    const ids = active.map((project) => project.id);
    if (!projectOrder.save(moveProject(ids, id, target, after))) {
      setError(
        "Could not save project order. Allow browser storage and try again.",
      );
    }
    setDragProject(null);
  }
  const archived = projects.filter((p) => p.archived_at);
  const label = (id: string, fallback: string) => names[id] ?? fallback;

  function act(
    work: () => Promise<Result>,
    undo: () => void,
    after?: () => void,
  ) {
    setError("");
    start(async () => {
      const result = await work();
      if (!result.ok) {
        undo();
        setError(result.message ?? "Something went wrong.");
      } else after?.();
    });
  }

  function rename(
    id: string,
    value: string,
    save: (v: string) => Promise<Result>,
  ) {
    const previous = names[id];
    setNames((n) => ({ ...n, [id]: value }));
    act(
      () => save(value),
      () =>
        setNames((n) => {
          const next = { ...n };
          if (previous === undefined) delete next[id];
          else next[id] = previous;
          return next;
        }),
    );
  }

  function hide(id: string, work: () => Promise<Result>, leaveTo?: string) {
    setHidden((h) => new Set(h).add(id));
    act(
      work,
      () =>
        setHidden((h) => {
          const next = new Set(h);
          next.delete(id);
          return next;
        }),
      () => {
        if (leaveTo && pathname.includes(id)) router.push(leaveTo);
      },
    );
  }

  const profile = (
    <span className="ws-top-actions">
      <NotificationBell me={me} team={team} />
      <ProfileMenu me={me} onNavigate={close} />
    </span>
  );

  return (
    <RealtimeProvider config={realtime}>
      <StatusProvider projects={projects}><PresenceProvider>
        <AccessMonitor />
        <div className="ws-app" data-drawer={drawer ? "open" : undefined}>
          <header className="ws-mobilebar" inert={drawer}>
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
            <span className="ws-push">{profile}</span>
          </header>
          <div className="ws-scrim" onClick={close} aria-hidden="true" />

          <aside
            ref={sidebar}
            id="ws-sidebar"
            className="ws-side"
            aria-label="Workspace"
          >
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

            <button
              type="button"
              className="ws-search-button"
              onClick={() => {
                close();
                setPalette(true);
              }}
            >
              <Icon name="search" />
              <span>Search or jump to…</span>
              <kbd>Ctrl K</kbd>
            </button>

            <nav className="ws-side-scroll">
              <SideLink
                href="/teams"
                icon="home"
                current={pathname === "/teams"}
                onNavigate={close}
              >
                Home
              </SideLink>
              <SideLink
                href="/teams/dashboard"
                icon="chart"
                current={pathname === "/teams/dashboard"}
                onNavigate={close}
              >
                Dashboard
              </SideLink>
              <SideLink
                href="/teams/calendar"
                icon="calendar"
                current={pathname === "/teams/calendar"}
                onNavigate={close}
              >
                Calendar
              </SideLink>
              <SideLink href="/teams/people" icon="user" current={pathname === "/teams/people"} onNavigate={close}>Team</SideLink>

              {error && (
                <p className="ws-side-error" role="alert">
                  {error}
                </p>
              )}

              <div className="ws-side-section">
                <span>Projects</span>
                <InlineCreate
                  label="New project"
                  placeholder="Project name, then Enter"
                  maxLength={120}
                  action={createProject}
                />
              </div>
              {active.length === 0 && (
                <p className="ws-side-empty">Create a project with +</p>
              )}
              <ul className="ws-tree">
                {active.map((project, index) => (
                  <ProjectNode
                    key={project.id}
                    project={project}
                    pathname={pathname}
                    onNavigate={close}
                    label={label}
                    hidden={hidden}
                    onMoveUp={
                      index > 0
                        ? () => reorderProject(project.id, active[index - 1].id)
                        : undefined
                    }
                    onMoveDown={
                      index < active.length - 1
                        ? () =>
                            reorderProject(
                              project.id,
                              active[index + 1].id,
                              true,
                            )
                        : undefined
                    }
                    onDragStart={() => setDragProject(project.id)}
                    onDragEnd={() => setDragProject(null)}
                    dragging={dragProject === project.id}
                    onDropProject={
                      dragProject
                        ? (after) =>
                            reorderProject(dragProject, project.id, after)
                        : undefined
                    }
                    onRenameProject={(v) =>
                      rename(project.id, v, (n) => renameProject(project.id, n))
                    }
                    onArchiveProject={
                      admin
                        ? () =>
                            confirm(
                              `Archive "${label(project.id, project.name)}"? You can restore it from Archived.`,
                            ) &&
                            hide(
                              project.id,
                              () => setProjectArchived(project.id, true),
                              "/teams",
                            )
                        : undefined
                    }
                    onRenameNote={(id, v) =>
                      rename(id, v, (n) => renameNote(id, n))
                    }
                    onDeleteNote={(id, title) =>
                      confirm(`Delete the page "${title}" for everyone?`) &&
                      hide(
                        id,
                        () => removeNote(id),
                        `/teams/p/${project.id}/notes`,
                      )
                    }
                  />
                ))}
              </ul>

              <div className="ws-side-section">
                <span>Channels</span>
                {admin && (
                  <InlineCreate
                    label="New channel"
                    placeholder="channel-name, then Enter"
                    maxLength={40}
                    action={createChannel}
                  />
                )}
              </div>
              <ul className="ws-tree">
                {channels
                  .filter((c) => !c.direct_members && !hidden.has(c.id))
                  .map((channel) => {
                    const href = `/teams/c/${channel.id}`;
                    const name = label(channel.id, channel.name);
                    return (
                      <li key={channel.id}>
                        <SideItem
                          href={href}
                          current={pathname === href}
                          onNavigate={close}
                          name={name}
                          className={unread(channel) ? "unread" : ""}
                          suffix={
                            unread(channel) ? (
                              <span
                                className="ws-unread-dot"
                                aria-label="Unread messages"
                              />
                            ) : null
                          }
                          prefix={
                            <span className="ws-hash" aria-hidden="true">
                              #
                            </span>
                          }
                          onRename={
                            admin
                              ? (v) =>
                                  rename(channel.id, v, (n) =>
                                    renameChannel(channel.id, n, channel.topic),
                                  )
                              : undefined
                          }
                          menu={
                            admin
                              ? [
                                  {
                                    label: "Delete channel",
                                    danger: true,
                                    onSelect: () =>
                                      confirm(
                                        `Delete #${name} and all its messages and files for everyone?`,
                                      ) &&
                                      hide(
                                        channel.id,
                                        () => deleteChannel(channel.id),
                                        "/teams",
                                      ),
                                  },
                                ]
                              : []
                          }
                        />
                      </li>
                    );
                  })}
              </ul>

              <DirectMessages channels={channels} team={team} me={me} pathname={pathname} unread={unread} close={close} />

              {archived.length > 0 && (
                <details className="ws-side-archived">
                  <summary>
                    <Icon name="archive" /> Archived ({archived.length})
                  </summary>
                  <ul className="ws-tree">
                    {archived.map((p) => (
                      <li key={p.id}>
                        <SideItem
                          href={`/teams/p/${p.id}`}
                          current={pathname.startsWith(`/teams/p/${p.id}`)}
                          onNavigate={close}
                          name={label(p.id, p.name)}
                          menu={
                            admin
                              ? [
                                  {
                                    label: "Restore",
                                    onSelect: () =>
                                      act(
                                        () => setProjectArchived(p.id, false),
                                        () => {},
                                      ),
                                  },
                                ]
                              : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </nav>
          </aside>

          <div className="ws-content" inert={drawer}>
            <header className="ws-topbar">{profile}</header>
            <TeamProvider team={team} me={me}>
              {children}
            </TeamProvider>
          </div>
          <CommandPalette
            projects={projects}
            channels={channels}
            open={palette}
            onOpenChange={setPalette}
          />
        </div>
      </PresenceProvider></StatusProvider>
    </RealtimeProvider>
  );
}

function ProfileMenu({
  me,
  onNavigate,
}: {
  me: Member;
  onNavigate: () => void;
}) {
  const name = me.display_name || me.email;
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useOutsideClose(box, open, () => setOpen(false));
  return (
    <div className="ws-profile" ref={box}>
      <button
        type="button"
        className="ws-profile-button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span
          className="ws-avatar"
          style={{ background: projectColor(me.email) }}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
        <span className="ws-profile-name">{name}</span>
      </button>
      {open && (
        <div className="ws-menu right" role="menu">
          <div className="ws-menu-head">
            <strong>{name}</strong>
            <span className="ws-meta">
              {me.email} · {isAdmin(me) ? "Admin" : "Member"}
            </span>
          </div>
          <Link
            href="/teams/settings"
            role="menuitem"
            className="ws-menu-item"
            onClick={() => {
              setOpen(false);
              onNavigate();
            }}
          >
            <Icon name="user" /> {isAdmin(me) ? "Profile & team settings" : "Your profile"}
          </Link>
          <form action={signOut}>
            <button type="submit" role="menuitem" className="ws-menu-item">
              <Icon name="close" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function useOutsideClose(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, close]);
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
  icon?: IconName;
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

type MenuItem = { label: string; danger?: boolean; onSelect: () => void };

/** A sidebar row with in-place rename and an optional ⋯ menu. */
function SideItem({
  href,
  current,
  onNavigate,
  name,
  prefix,
  icon,
  depth = 0,
  onRename,
  menu = [],
  className = "",
  suffix,
}: {
  href: string;
  current: boolean;
  onNavigate: () => void;
  name: string;
  prefix?: React.ReactNode;
  icon?: IconName;
  depth?: number;
  onRename?: (value: string) => void;
  menu?: MenuItem[];
  className?: string;
  suffix?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useOutsideClose(box, open, () => setOpen(false));
  const items: MenuItem[] = [
    ...(onRename
      ? [{ label: "Rename", onSelect: () => setEditing(true) }]
      : []),
    ...menu,
  ];

  if (editing && onRename)
    return (
      <div className="ws-side-row" style={{ paddingLeft: 6 + depth * 16 }}>
        <input
          className="ws-input ws-rename-input"
          defaultValue={name}
          aria-label={`Rename ${name}`}
          maxLength={200}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => {
            if (event.key === "Escape") setEditing(false);
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          onBlur={(event) => {
            const value = event.currentTarget.value.trim();
            setEditing(false);
            if (value && value !== name) onRename(value);
          }}
        />
      </div>
    );

  return (
    <div className={`ws-side-row${open ? " menu-open" : ""}`} ref={box}>
      <Link
        href={href}
        className={`ws-side-link ${className}`}
        aria-current={current ? "page" : undefined}
        onClick={onNavigate}
        onDoubleClick={(event) => {
          if (!onRename) return;
          event.preventDefault();
          setEditing(true);
        }}
        title={onRename ? `${name} — double-click to rename` : name}
        style={{ paddingLeft: 10 + depth * 16 }}
      >
        {icon && <Icon name={icon} />}
        {prefix}
        <span className="ws-ellipsis">{name}</span>
        {suffix}
      </Link>
      {items.length > 0 && (
        <>
          <button
            type="button"
            className="ws-row-menu"
            aria-label={`More actions for ${name}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            ⋯
          </button>
          {open && (
            <div className="ws-menu" role="menu">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={`ws-menu-item${item.danger ? " danger" : ""}`}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProjectNode({
  project,
  pathname,
  onNavigate,
  label,
  hidden,
  onRenameProject,
  onArchiveProject,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  dragging,
  onDropProject,
  onRenameNote,
  onDeleteNote,
}: {
  project: SidebarProject;
  pathname: string;
  onNavigate: () => void;
  label: (id: string, fallback: string) => string;
  hidden: Set<string>;
  onRenameProject: (value: string) => void;
  onArchiveProject?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragging: boolean;
  onDropProject?: (after: boolean) => void;
  onRenameNote: (id: string, value: string) => void;
  onDeleteNote: (id: string, title: string) => void;
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
  const name = label(project.id, project.name);
  const views: { path: string; label: string; icon: IconName }[] = [
    { path: "/overview", label: "Overview", icon: "overview" },
    { path: "", label: "Board", icon: "board" },
    { path: "/list", label: "List", icon: "list" },
    { path: "/calendar", label: "Calendar", icon: "calendar" },
    { path: "/notes", label: "Notes", icon: "notes" },
  ];

  return (
    <li>
      <div
        className={`ws-project-row${dragging ? " is-dragging" : ""}`}
        onDragOver={(event) => {
          if (onDropProject) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }
        }}
        onDrop={(event) => {
          if (!onDropProject) return;
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          onDropProject(event.clientY > bounds.top + bounds.height / 2);
        }}
      >
        <button
          type="button"
          draggable
          className="ws-project-grip"
          aria-label={`Drag to reorder ${name}; use project menu to move up or down`}
          title="Drag to reorder. Or use Move up / Move down in the project menu."
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", project.id);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
        >
          ⠿
        </button>
        <button
          type="button"
          className="ws-caret-button"
          aria-label={`${open ? "Collapse" : "Expand"} ${name}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span style={{ transform: open ? "rotate(90deg)" : undefined }}>
            <Icon name="chevron" size={14} />
          </span>
        </button>
        <SideItem
          href={base}
          current={pathname === base}
          onNavigate={onNavigate}
          name={name}
          className="ws-project-link"
          prefix={
            <span
              className="ws-project-dot"
              style={{ background: projectColor(project.id) }}
              aria-hidden="true"
            />
          }
          onRename={onRenameProject}
          menu={[
            ...(onMoveUp ? [{ label: "Move up", onSelect: onMoveUp }] : []),
            ...(onMoveDown
              ? [{ label: "Move down", onSelect: onMoveDown }]
              : []),
            ...(onArchiveProject
              ? [{ label: "Archive project", onSelect: onArchiveProject }]
              : []),
          ]}
        />
      </div>
      {open && (
        <ul className="ws-tree">
          {views.map((v) => (
            <li key={v.label}>
              <SideLink
                href={base + v.path}
                icon={v.icon}
                depth={1}
                current={pathname === base + v.path}
                onNavigate={onNavigate}
              >
                {v.label}
              </SideLink>
            </li>
          ))}
          {project.notes
            .filter((n) => !hidden.has(n.id))
            .map((note) => {
              const href = `${base}/notes/${note.id}`;
              const title = label(note.id, note.title);
              return (
                <li key={note.id}>
                  <SideItem
                    href={href}
                    icon="doc"
                    depth={2}
                    current={pathname === href}
                    onNavigate={onNavigate}
                    name={title}
                    onRename={(v) => onRenameNote(note.id, v)}
                    menu={[
                      {
                        label: "Delete page",
                        danger: true,
                        onSelect: () => onDeleteNote(note.id, title),
                      },
                    ]}
                  />
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

function InlineCreate({
  label,
  placeholder,
  maxLength,
  action,
}: {
  label: string;
  placeholder: string;
  maxLength: number;
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        type="button"
        className="ws-icon-button small"
        aria-label={label}
        title={label}
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
        await action(formData);
      }}
    >
      <input
        className="ws-input"
        name="name"
        aria-label={label}
        placeholder={placeholder}
        maxLength={maxLength}
        required
        autoFocus
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        onBlur={(event) => !event.currentTarget.value && setOpen(false)}
      />
    </form>
  );
}
