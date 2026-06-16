import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./lib/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

const AUTH_ROUTES = ["/login", "/signup"];
const PUBLIC_ROUTES = ["/login", "/signup", "/auth/confirm", "/auth/github"];

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((r) =>
    request.nextUrl.pathname.startsWith(r),
  );
  const isAuthRoute = AUTH_ROUTES.some((r) =>
    request.nextUrl.pathname.startsWith(r),
  );

  // Prevent brute force attacks on login and signup
  if (isAuthRoute) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";

    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  // Logged-out user hitting a protected route
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  // Logged-in user hitting login or signup
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Send user data to avoid repetitive code
  if (user) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email ?? "");
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
