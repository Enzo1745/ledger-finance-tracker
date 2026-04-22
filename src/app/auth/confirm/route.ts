import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Case 1 : auth with GitHub
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.redirect(
      new URL("/login?error=Could not confirm github", request.url),
    );
  }
  // Case 2 : auth with mail
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    if (!error)
      return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.redirect(
    new URL("/login?error=Could not confirm email", request.url),
  );
}
