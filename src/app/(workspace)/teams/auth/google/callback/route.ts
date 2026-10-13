import { NextResponse, type NextRequest } from "next/server";
import {
  GOOGLE_CALLBACK_PATH,
  GOOGLE_COOKIE,
  exchangeCode,
  googleConfig,
  parseAttempt,
  sameState,
} from "@/lib/workspace/google";
import { safeWorkspacePath } from "@/lib/workspace/model";
import { publicUrl } from "@/lib/workspace/origin";
import {
  createWorkspaceClient,
  supabaseConfig,
} from "@/lib/workspace/supabase";

export const dynamic = "force-dynamic";

// Google sends the visitor here; the ID token becomes a Supabase session.
export async function GET(request: NextRequest) {
  const attempt = parseAttempt(request.cookies.get(GOOGLE_COOKIE)?.value);
  const params = request.nextUrl.searchParams;
  const google = googleConfig();
  const finish = (path: string) => {
    const response = NextResponse.redirect(publicUrl(path, request));
    response.cookies.delete({ name: GOOGLE_COOKIE, path: "/teams/auth" });
    return response;
  };

  const code = params.get("code");
  if (
    !google ||
    !supabaseConfig() ||
    !attempt ||
    !code ||
    !sameState(attempt.state, params.get("state"))
  )
    return finish("/teams/login?error=google");

  const redirectUri = publicUrl(GOOGLE_CALLBACK_PATH, request).toString();
  const idToken = await exchangeCode(code, redirectUri, google).catch(
    () => null,
  );
  if (!idToken) return finish("/teams/login?error=google");

  const supabase = await createWorkspaceClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
    nonce: attempt.nonce,
  });
  if (error) return finish("/teams/login?error=google");
  return finish(safeWorkspacePath(attempt.next));
}
