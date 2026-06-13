import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./lib/supabase/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/auth/confirm", "/auth/github"];

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPublic = PUBLIC_ROUTES.some((r) =>
    request.nextUrl.pathname.startsWith(r),
  );

  // Logged-out user hitting a protected route
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  // Logged-in user hitting login or signup
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
