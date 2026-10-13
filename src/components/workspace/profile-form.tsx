"use client";

import { useActionState } from "react";
import { updateMyName } from "@/app/(workspace)/teams/actions";

export default function ProfileForm({
  email,
  displayName,
}: {
  email: string;
  displayName: string;
}) {
  const [state, action, pending] = useActionState(updateMyName, null);
  return (
    <form action={action} className="ws-form">
      <label className="ws-field">
        Display name
        <input
          className="ws-input"
          name="displayName"
          defaultValue={displayName}
          placeholder="e.g. Nego"
          required
          maxLength={80}
          autoComplete="name"
        />
      </label>
      <label className="ws-field">
        Sign-in email
        <input className="ws-input" value={email} readOnly disabled />
      </label>
      <div className="ws-form-actions">
        <button type="submit" className="ws-button" disabled={pending}>
          {pending ? "Saving…" : "Save name"}
        </button>
        {state && (
          <span
            className={state.ok ? "ws-ok-text" : "ws-error-text"}
            role="status"
          >
            {state.ok
              ? "Saved. Your name is updated everywhere."
              : state.message}
          </span>
        )}
      </div>
    </form>
  );
}
