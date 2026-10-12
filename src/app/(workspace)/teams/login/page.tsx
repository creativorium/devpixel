import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/workspace/login-form";
import { safeWorkspacePath } from "@/lib/workspace/model";
import {
  createWorkspaceClient,
  supabaseConfig,
} from "@/lib/workspace/supabase";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

const errors: Record<string, string> = {
  setup:
    "The workspace is not connected to Supabase yet. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (see WORKSPACE.md).",
  link: "That sign-in link is invalid or has expired. Request a new one.",
  google: "Google sign-in could not start. Try again or use an email link.",
  "not-allowed":
    "This account is not on the DevnPixel team list. Ask the workspace owner to add your email.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeWorkspacePath(params.next);
  const configured = Boolean(supabaseConfig());
  let signedInAs: string | null = null;

  if (configured) {
    const supabase = await createWorkspaceClient();
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email?.toLowerCase();
    if (email) {
      const { data: member } = await supabase
        .from("members")
        .select("email")
        .eq("email", email)
        .maybeSingle();
      if (member) redirect(next);
      signedInAs = email;
    }
  }
  const error = signedInAs
    ? errors["not-allowed"]
    : !configured
      ? errors.setup
      : params.error
        ? errors[params.error]
        : undefined;

  return (
    <main className="ws-login">
      <div className="ws-login-card">
        <div>
          <p className="ws-meta">DevnPixel</p>
          <h1>Team workspace</h1>
        </div>
        {error && (
          <p className="ws-notice error" role="alert">
            {error}
          </p>
        )}
        {signedInAs ? (
          <form action={signOut}>
            <p>
              Signed in as <strong>{signedInAs}</strong>.
            </p>
            <button type="submit" className="ws-button ghost">
              Sign out and use another account
            </button>
          </form>
        ) : (
          configured && (
            <>
              <a
                className="ws-button ghost"
                href={`/teams/auth/google?next=${encodeURIComponent(next)}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
                  />
                </svg>
                Continue with Google
              </a>
              <div className="ws-divider">or</div>
              <LoginForm next={next} />
            </>
          )
        )}
      </div>
    </main>
  );
}
