import { NextResponse, type NextRequest } from "next/server";
import { safeWorkspacePath } from "@/lib/workspace/model";
import {
  createWorkspaceClient,
  supabaseConfig,
} from "@/lib/workspace/supabase";

export const dynamic = "force-dynamic";

// A plain link (not a form) starts Google sign-in, so the site's form-action CSP stays strict.
export async function GET(request: NextRequest) {
  if (!supabaseConfig())
    return NextResponse.redirect(
      new URL("/teams/login?error=setup", request.url),
    );
  const callback = new URL("/teams/auth/callback", request.url);
  callback.searchParams.set(
    "next",
    safeWorkspacePath(request.nextUrl.searchParams.get("next")),
  );
  const supabase = await createWorkspaceClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });
  if (error || !data.url)
    return NextResponse.redirect(
      new URL("/teams/login?error=google", request.url),
    );
  return NextResponse.redirect(data.url);
}
