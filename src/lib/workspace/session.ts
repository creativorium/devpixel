import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createWorkspaceClient, supabaseConfig } from "./supabase";
import type { Member } from "./model";

/**
 * Data access gate for every workspace page and action. Verifies the session with
 * Supabase Auth and that the email is on the team allowlist. Row level security
 * enforces the same rule in the database.
 */
export const requireMember = cache(async () => {
  await connection(); // Always per-request, even before Supabase is configured.
  if (!supabaseConfig()) redirect("/teams/login?error=setup");
  const supabase = await createWorkspaceClient();
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (error || !email) redirect("/teams/login");
  const { data: members } = await supabase
    .from("members")
    .select("email, display_name")
    .order("display_name");
  const team = (members ?? []) as Member[];
  const me = team.find((m) => m.email === email);
  if (!me) redirect("/teams/login?error=not-allowed");
  return { supabase, me, team };
});
