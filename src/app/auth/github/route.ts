import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/confirm`,
    },
  });
  if (data.url) return NextResponse.redirect(data.url);
  return NextResponse.redirect(
    new URL("/login?error=OAuth failed", request.url),
  );
}
