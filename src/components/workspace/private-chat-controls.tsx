"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addConversationMembers,
  deletePrivateConversation,
} from "@/app/(workspace)/teams/direct-actions";
import { type Channel, memberName } from "@/lib/workspace/model";
import { useTeam } from "./team-context";

export default function PrivateChatControls({
  channel,
  mode,
}: {
  channel: Channel;
  mode?: "add" | "delete";
}) {
  const { team } = useTeam();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<"add" | "delete">("add"),
    [selected, setSelected] = useState<string[]>([]),
    [error, setError] = useState("");
  const [pending, start] = useTransition();
  const members = channel.direct_members ?? [];
  function open(next: "add" | "delete") {
    setAction(next);
    setSelected([]);
    setError("");
    dialog.current?.showModal();
  }
  return (
    <>
      {mode !== "delete" && (
        <button
          type="button"
          className="ws-button ghost small"
          disabled={members.length >= 5}
          onClick={() => open("add")}
        >
          Add people
        </button>
      )}
      {mode !== "add" && (
        <button
          type="button"
          className="ws-button ghost small"
          onClick={() => open("delete")}
        >
          Delete chat
        </button>
      )}
      <dialog
        ref={dialog}
        className="ws-chat-manage-dialog"
        aria-label={action === "add" ? "Add people to chat" : "Delete chat"}
        onCancel={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        <h2>{action === "add" ? "Add people" : "Delete this chat?"}</h2>
        <p>
          {action === "add"
            ? `New participants can see all earlier messages and attachments in this conversation. ${members.length}/5 people currently.`
            : "This permanently deletes this conversation and its messages for everyone. This cannot be undone."}
        </p>
        {action === "add" && (
          <div className="ws-dm-members">
            {team
              .filter((m) => !members.includes(m.email))
              .map((m) => (
                <label key={m.email} className="ws-dm-choice">
                  <input
                    type="checkbox"
                    checked={selected.includes(m.email)}
                    disabled={
                      pending ||
                      (!selected.includes(m.email) &&
                        members.length + selected.length >= 5)
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
        )}
        {error && (
          <p role="alert" className="ws-error-text">
            {error}
          </p>
        )}
        <div className="ws-form-actions">
          <button
            type="button"
            className="ws-button ghost small"
            disabled={pending}
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`ws-button small${action === "delete" ? " danger" : ""}`}
            disabled={pending || (action === "add" && !selected.length)}
            onClick={() =>
              start(async () => {
                setError("");
                try {
                  const result =
                    action === "add"
                      ? await addConversationMembers(channel.id, selected)
                      : await deletePrivateConversation(channel.id);
                  if (result.error) setError(result.error);
                  else {
                    dialog.current?.close();
                    if (action === "delete") router.push("/teams");
                    router.refresh();
                  }
                } catch {
                  setError("Could not finish. Please try again.");
                }
              })
            }
          >
            {pending
              ? "Saving…"
              : action === "add"
                ? "Add to conversation"
                : "Delete for everyone"}
          </button>
        </div>
      </dialog>
    </>
  );
}
