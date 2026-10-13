"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { emailSchema, safeWorkspacePath } from "@/lib/workspace/model";
import {
  createWorkspaceClient,
  supabaseConfig,
} from "@/lib/workspace/supabase";

export type LoginState = { status: "idle" | "sent" | "error"; message: string };

export async function sendMagicLink(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!supabaseConfig())
    return { status: "error", message: "The workspace is not set up yet." };
  const email = emailSchema.safeParse(formData.get("email") ?? "");
  if (!email.success)
    return { status: "error", message: "Enter a valid email address." };

  const origin = (await headers()).get("origin");
  if (!origin) return { status: "error", message: "Please try again." };
  const callback = new URL("/teams/auth/callback", origin);
  callback.searchParams.set(
    "next",
    safeWorkspacePath(String(formData.get("next") ?? "")),
  );

  const supabase = await createWorkspaceClient();
  // shouldCreateUser: false — only people already invited in Supabase receive a link.
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: callback.toString() },
  });
  if (error?.status === 429)
    return {
      status: "error",
      message: "Too many sign-in emails. Wait a few minutes and try again.",
    };
  // Same answer for unknown emails, so the form does not reveal who is on the team.
  return {
    status: "sent",
    message: `If ${email.data} belongs to the team, a sign-in link is on its way. Open it in this browser.`,
  };
}

export async function signOut() {
  if (supabaseConfig()) {
    const supabase = await createWorkspaceClient();
    await supabase.auth.signOut();
  }
  redirect("/teams/login");
}
