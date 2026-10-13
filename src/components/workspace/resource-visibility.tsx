"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getResourceVisibility,
  saveResourceVisibility,
} from "@/app/(workspace)/teams/access-actions";
import { isAdmin } from "@/lib/workspace/model";
import { useTeam } from "./team-context";

export default function ResourceVisibility({
  kind,
  id,
}: {
  kind: "project" | "channel";
  id: string;
}) {
  const { me, team } = useTeam();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selection, setSelection] = useState<string[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  if (!isAdmin(me)) return null;

  function open() {
    setLoaded(false);
    setMessage("");
    dialog.current?.showModal();
    start(async () => {
      try {
        const result = await getResourceVisibility(kind, id);
        if (result.ok) {
          setSelection(result.visibleTo);
          setLoaded(true);
        } else setMessage(result.message);
      } catch {
        setMessage("Could not load visibility. Please try again.");
      }
    });
  }

  return (
    <>
      <button type="button" className="ws-button ghost small" onClick={open}>
        Visibility
      </button>
      <dialog
        ref={dialog}
        className="ws-visibility"
        aria-labelledby={`visibility-${id}`}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            start(async () => {
              try {
                const result = await saveResourceVisibility(
                  kind,
                  id,
                  selection,
                );
                if (result.ok) {
                  dialog.current?.close();
                  router.refresh();
                } else setMessage(result.message);
              } catch {
                setMessage("Could not save visibility. Please try again.");
              }
            });
          }}
        >
          <h2 id={`visibility-${id}`}>
            {kind === "project" ? "Project" : "Chat channel"} visibility
          </h2>
          <p className="ws-meta">
            Only admins can change access. Admins always have access.
          </p>
          {!loaded && pending && <p role="status">Loading visibility...</p>}
          {loaded && (
            <fieldset disabled={pending}>
              <legend>Who can access this {kind}?</legend>
              <label className="ws-visibility-option">
                <input
                  type="radio"
                  name="visibility"
                  checked={selection === null}
                  onChange={() => setSelection(null)}
                />{" "}
                Everyone <span>All current and future team members</span>
              </label>
              <label className="ws-visibility-option">
                <input
                  type="radio"
                  name="visibility"
                  checked={selection !== null}
                  onChange={() => setSelection([])}
                />{" "}
                Selected members{" "}
                <span>Only admins and the people you select below</span>
              </label>
              {selection !== null && (
                <div className="ws-visibility-members">
                  {team
                    .filter((member) => !isAdmin(member))
                    .map((member) => (
                      <label key={member.email}>
                        <input
                          type="checkbox"
                          checked={selection.includes(member.email)}
                          onChange={(event) =>
                            setSelection(
                              event.target.checked
                                ? [...selection, member.email]
                                : selection.filter(
                                    (email) => email !== member.email,
                                  ),
                            )
                          }
                        />
                        <span>
                          {member.display_name || member.email}
                          <small>{member.email}</small>
                        </span>
                      </label>
                    ))}
                  {selection.length === 0 && (
                    <p className="ws-meta">
                      No members selected: only admins can access this {kind}.
                    </p>
                  )}
                </div>
              )}
            </fieldset>
          )}
          {message && (
            <p className="ws-notice error" role="alert">
              {message}
            </p>
          )}
          <div className="ws-visibility-actions">
            <button
              type="button"
              className="ws-button ghost"
              disabled={pending}
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ws-button"
              disabled={pending || !loaded}
            >
              {pending && loaded ? "Saving..." : "Save visibility"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
