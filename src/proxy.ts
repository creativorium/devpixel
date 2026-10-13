import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/teams/login", "/teams/auth/"];

// Refreshes the Supabase session cookie and sends signed-out visitors to the login page.
// This is an optimistic check only; pages and actions verify membership via requireMember().
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (!url || !key) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(
      new URL("/teams/login?error=setup", request.url),
    );
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet)
          response.cookies.set(name, value, options);
        for (const [header, value] of Object.entries(headers ?? {}))
          response.headers.set(header, value);
      },
    },
  });
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && !isPublic) {
    const login = new URL("/teams/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(login);
    for (const cookie of response.cookies.getAll())
      redirect.cookies.set(cookie);
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ["/teams", "/teams/:path*"],
};
