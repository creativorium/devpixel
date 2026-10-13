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
  // getClaims verifies the session JWT's signature locally (cached signing keys)
  // instead of a network call to Supabase Auth on every request; RLS still checks
  // the same token in the database.
  const { data, error } = await supabase.auth.getClaims();
  const claimed = data?.claims?.email;
  const email = typeof claimed === "string" ? claimed.toLowerCase() : "";
  if (error || !email) redirect("/teams/login");
  const load = (columns: string) =>
    supabase.from("members").select(columns).order("display_name");
  const withRoles = await load("email, display_name, role");
  // Before the roles migration runs, everyone is treated as a member.
  const members = withRoles.error
    ? (await load("email, display_name")).data
    : withRoles.data;
  const team = (members ?? []) as unknown as Member[];
  const me = team.find((m) => m.email === email);
  if (!me) redirect("/teams/login?error=not-allowed");
  return { supabase, me, team };
});
