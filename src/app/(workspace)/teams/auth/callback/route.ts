import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeWorkspacePath } from "@/lib/workspace/model";
import {
  createWorkspaceClient,
  supabaseConfig,
} from "@/lib/workspace/supabase";

export const dynamic = "force-dynamic";

const otpTypes: EmailOtpType[] = ["magiclink", "email", "invite", "signup"];

// Landing point for magic links (code or token_hash) and Google sign-in (code).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeWorkspacePath(params.get("next"));
  const fail = NextResponse.redirect(
    new URL("/teams/login?error=link", request.url),
  );
  if (!supabaseConfig()) return fail;

  const supabase = await createWorkspaceClient();
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type && otpTypes.includes(type)
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Missing code") };
  if (error) return fail;
  return NextResponse.redirect(new URL(next, request.url));
}
