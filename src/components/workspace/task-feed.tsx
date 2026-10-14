"use client";

import { useEffect, useState, type ReactNode } from "react";
import { addComment, deleteComment } from "@/app/(workspace)/teams/actions";
import type { FeedItem } from "@/app/(workspace)/teams/api/tasks/[taskId]/feed/route";
import { describeActivity } from "@/lib/workspace/activity";
import { initials, memberName } from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import LocalTime from "./local-time";
import { useStatuses } from "./status-context";
import { useMentionPicker } from "./mention-picker";
import { RichText, useTeam } from "./team-context";

// Keep the conversation first, with the task audit trail below it.
export default function TaskFeed({
  taskId,
  historySummary,
}: {
  taskId: string;
  historySummary?: ReactNode;
}) {
  const { team, me } = useTeam();
  const statuses = useStatuses();
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = (event: Event) => {
      if ((event as CustomEvent).detail === taskId)
        setRevision((value) => value + 1);
    };
    window.addEventListener("workspace:time-logged", refresh);
    return () => window.removeEventListener("workspace:time-logged", refresh);
  }, [taskId]);
  const mentions = useMentionPicker(draft, setDraft);

  useEffect(() => {
    let alive = true;
    fetch(`/teams/api/tasks/${taskId}/feed`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items: FeedItem[]; unavailable?: boolean } | null) => {
        if (!alive) return;
        setItems(data?.items ?? []);
        setUnavailable(Boolean(data?.unavailable));
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [taskId, revision]);

  async function post() {
    const body = draft.trim();
    if (!body || posting) return;
    setPosting(true);
    setError("");
    const result = await addComment(taskId, body);
    setPosting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDraft("");
    setItems((list) => [
      ...(list ?? []),
      {
        kind: "comment",
        id: result.id!,
        author: me?.email ?? "",
        body,
        at: result.at ?? new Date().toISOString(),
        edited: false,
      },
    ]);
  }

  async function remove(id: string) {
    if (!confirm("Delete this comment?")) return;
    const before = items;
    setItems((list) => (list ?? []).filter((i) => i.id !== id));
    const result = await deleteComment(id);
    if (!result.ok) {
      setItems(before);
      setError(result.message);
    }
  }

  const comments = (items ?? []).filter((i) => i.kind === "comment");
  const history = (items ?? []).filter((i) => i.kind === "activity");

  return (
    <section className="ws-task-section ws-feed" aria-label="Comments and history">
      <div className="ws-task-files-head">
        <span className="ws-field">Comments</span>
      </div>
      {unavailable && (
        <p className="ws-meta">
          Comments need the latest database update (WORKSPACE.md).
        </p>
      )}
      {items === null ? (
        <p className="ws-meta">Loading…</p>
      ) : (
        <ol className="ws-feed-list">
          {comments.map((item) => {
            const name = memberName(team, item.author);
            return (
              <li key={`c-${item.id}`} className="ws-feed-comment">
                <span
                  className="ws-avatar"
                  style={{ background: projectColor(item.author) }}
                  aria-hidden="true"
                >
                  {initials(name)}
                </span>
                <div className="ws-feed-bubble">
                  <div className="ws-feed-meta">
                    <strong>{name}</strong>
                    <span className="ws-meta">
                      <LocalTime
                        iso={item.at}
                        options={{
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }}
                      />
                    </span>
                    {item.author === me?.email && (
                      <button
                        type="button"
                        className="ws-inline-link ws-feed-delete"
                        onClick={() => void remove(item.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="ws-msg-body">
                    <RichText text={item.body} />
                  </div>
                </div>
              </li>
            );
          })}
          {comments.length === 0 && (
            <li className="ws-meta">No comments yet.</li>
          )}
        </ol>
      )}
      <div className="ws-feed-composer ws-mention-host">
        {mentions.popup}
        <textarea
          className="ws-input"
          rows={2}
          value={draft}
          maxLength={4000}
          placeholder="Write a comment… @ to mention, Ctrl+Enter to post"
          aria-label="Write a comment"
          {...mentions.fieldProps}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (mentions.onKeyDown(event)) return;
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void post();
            }
          }}
        />
        <button
          type="button"
          className="ws-button small"
          disabled={!draft.trim() || posting}
          onClick={() => void post()}
        >
          {posting ? "Posting…" : "Comment"}
        </button>
      </div>
      {error && (
        <p className="ws-error-text" role="alert">
          {error}
        </p>
      )}
      <section className="ws-feed-history" aria-label="Task history">
        <div className="ws-task-files-head">
          <span className="ws-field">Activity</span>
          <label className="ws-check">
            <input type="checkbox" checked={showHistory} onChange={event => setShowHistory(event.target.checked)} />
            Show history
          </label>
        </div>
        {showHistory && <>
          {historySummary && <div className="ws-feed-summary ws-meta">{historySummary}</div>}
          {items === null ? <p className="ws-meta">Loading history…</p> : <ol className="ws-feed-list">
            {history.map(item => <li key={`a-${item.id}`} className="ws-feed-event">
              <span className="ws-feed-dot" aria-hidden="true" />
              <span>
                <strong>{memberName(team, item.author)}</strong>{" "}
                {describeActivity(item.type, item.detail, team, statuses)}
                <span className="ws-meta">{" · "}<LocalTime iso={item.at} options={{ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }} /></span>
              </span>
            </li>)}
            {history.length === 0 && <li className="ws-meta">No history yet.</li>}
          </ol>}
        </>}
      </section>
    </section>
  );
}
