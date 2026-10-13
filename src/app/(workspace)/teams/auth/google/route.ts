import { NextResponse, type NextRequest } from "next/server";
import {
  GOOGLE_CALLBACK_PATH,
  GOOGLE_COOKIE,
  googleAuthUrl,
  googleConfig,
  newAttempt,
} from "@/lib/workspace/google";
import { safeWorkspacePath } from "@/lib/workspace/model";
import { publicUrl } from "@/lib/workspace/origin";
import {
  createWorkspaceClient,
  supabaseConfig,
} from "@/lib/workspace/supabase";

export const dynamic = "force-dynamic";

// A plain link (not a form) starts Google sign-in, so the site's form-action CSP stays strict.
export async function GET(request: NextRequest) {
  if (!supabaseConfig())
    return NextResponse.redirect(
      publicUrl("/teams/login?error=setup", request),
    );
  const next = safeWorkspacePath(request.nextUrl.searchParams.get("next"));

  // Preferred: Google returns to devnpixel.com, so its account picker names this site.
  const google = googleConfig();
  if (google) {
    const attempt = newAttempt(next);
    const redirectUri = publicUrl(GOOGLE_CALLBACK_PATH, request).toString();
    const response = NextResponse.redirect(
      googleAuthUrl(google.clientId, redirectUri, attempt),
    );
    response.cookies.set(GOOGLE_COOKIE, JSON.stringify(attempt), {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/teams/auth",
      maxAge: 600,
    });
    return response;
  }

  // Fallback: Supabase-hosted Google flow (the picker shows the Supabase domain).
  const callback = publicUrl("/teams/auth/callback", request);
  callback.searchParams.set("next", next);
  const supabase = await createWorkspaceClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });
  if (error || !data.url)
    return NextResponse.redirect(
      publicUrl("/teams/login?error=google", request),
    );
  return NextResponse.redirect(data.url);
}
