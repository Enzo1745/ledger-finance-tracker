import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");

  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${url.origin}/auth/confirm`,
    },
  });

  if (data.url) {
    const response = NextResponse.redirect(data.url);
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      response.cookies.set("oauth_next", next, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 10,
        path: "/",
      });
    }
    return response;
  }
  return NextResponse.redirect(
    new URL("/login?error=OAuth failed", request.url),
  );
}
