import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  const stashed = cookieStore.get("oauth_next")?.value;
  const nextPath =
    stashed && stashed.startsWith("/") && !stashed.startsWith("//")
      ? stashed
      : "/dashboard";

  const successResponse = () => {
    const response = NextResponse.redirect(new URL(nextPath, request.url));
    response.cookies.delete("oauth_next");
    return response;
  };

  // Case 1 : auth with GitHub
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return successResponse();
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
    if (!error) return successResponse();
  }
  return NextResponse.redirect(
    new URL("/login?error=Could not confirm email", request.url),
  );
}
