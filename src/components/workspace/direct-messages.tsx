"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startPrivateConversation } from "@/app/(workspace)/teams/direct-actions";
import {
  initials,
  memberName,
  privateChatName,
  type Channel,
  type Member,
} from "@/lib/workspace/model";
import { useProjectOrder } from "./project-order";
import { orderedProjects } from "@/lib/workspace/project-order";
import Icon from "./icons";
import PrivateChatControls from "./private-chat-controls";

export default function DirectMessages({
  channels,
  team,
  me,
  pathname,
  unread,
  close,
}: {
  channels: Channel[];
  team: Member[];
  me: Member;
  pathname: string;
  unread: (channel: Channel) => boolean;
  close: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const ordering = useProjectOrder(`dm:${me.email}`);
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) router.refresh();
    };
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);
  const all = orderedProjects(
    channels.filter((c) => c.direct_members?.includes(me.email)),
    ordering.order,
  );
  const chats = all;
  function persist(ok: boolean) {
    if (!ok) setError("Could not save sidebar preferences in this browser.");
  }
  function move(id: string, direction: number) {
    const ids = chats.map((c) => c.id),
      index = ids.indexOf(id),
      next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    persist(ordering.save(ids));
  }
  return (
    <>
      <div className="ws-side-section">
        <span>Direct messages</span>
        <button
          type="button"
          className="ws-icon-button small"
          aria-label="New private conversation"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            setSelected([]);
          }}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
      {open && (
        <div className="ws-dm-picker">
          <strong className="ws-meta">Choose teammates</strong>
          <p className="ws-meta">
            {selected.length + 1}/5 people, including you.
          </p>
          <div className="ws-dm-members">
            {team
              .filter((m) => m.email !== me.email)
              .map((m) => (
                <label className="ws-dm-choice" key={m.email}>
                  <input
                    type="checkbox"
                    checked={selected.includes(m.email)}
                    disabled={
                      pending ||
                      (!selected.includes(m.email) && selected.length >= 4)
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, m.email]
                          : selected.filter((email) => email !== m.email),
                      )
                    }
                  />
                  {memberName(team, m.email)}
                </label>
              ))}
          </div>
          <button
            type="button"
            className="ws-button small"
            disabled={pending || !selected.length}
            onClick={() =>
              start(async () => {
                setError("");
                try {
                  const result = await startPrivateConversation(selected);
                  if (result.error) setError(result.error);
                  else if (result.id) {
                    setOpen(false);
                    close();
                    router.push(`/teams/c/${result.id}`);
                    router.refresh();
                  }
                } catch {
                  setError("Could not open the conversation. Try again.");
                }
              })
            }
          >
            {pending ? "Opening…" : "Open conversation"}
          </button>
        </div>
      )}
      {error && (
        <p className="ws-error-text" role="alert">
          {error}
        </p>
      )}
      <ul className="ws-tree">
        {chats.map((channel, index) => {
          const name = privateChatName(channel, team, me.email),
            href = `/teams/c/${channel.id}`;
          return (
            <li key={channel.id} className="ws-dm-row">
              <Link
                href={href}
                onClick={close}
                title={name}
                aria-current={pathname === href ? "page" : undefined}
                className={`ws-dm-link${pathname === href ? " active" : ""}`}
              >
                <span className="ws-dm-avatar" aria-hidden="true">
                  {channel.direct_members!.length > 2
                    ? channel.direct_members!.length
                    : initials(name)}
                </span>
                <span>{name}</span>
                {unread(channel) && (
                  <span
                    className="ws-unread-dot"
                    aria-label="Unread messages"
                  />
                )}
              </Link>
              <details className="ws-dm-options">
                <summary aria-label={`Options for ${name}`}>
                  <Icon name="more" size={18} />
                </summary>
                <div>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(channel.id, -1)}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={index === chats.length - 1}
                    onClick={() => move(channel.id, 1)}
                  >
                    Move down
                  </button>
                  <PrivateChatControls channel={channel} />
                </div>
              </details>
            </li>
          );
        })}
      </ul>
      {!chats.length && !open && (
        <p className="ws-dm-hint">Use + for a private or group chat.</p>
      )}
    </>
  );
}
