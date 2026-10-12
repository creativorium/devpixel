"use client";

import { useActionState } from "react";
import {
  sendMagicLink,
  type LoginState,
} from "@/app/(workspace)/teams/login/actions";

const initial: LoginState = { status: "idle", message: "" };

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(sendMagicLink, initial);
  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <label className="ws-field">
        Work email
        <input
          className="ws-input"
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      <button type="submit" className="ws-button" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state.message && (
        <p
          className={`ws-notice ${state.status === "sent" ? "ok" : "error"}`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
