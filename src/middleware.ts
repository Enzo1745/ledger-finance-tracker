import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./lib/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

const AUTH_ROUTES = ["/login", "/signup"];
const PUBLIC_ROUTES = ["/login", "/signup", "/auth/confirm", "/auth/github"];

const startsWithAny = (pathname: string, routes: string[]) =>
  routes.some((r) => pathname.startsWith(r));

// Throttle auth routes to prevent brute force. Returns a 429 response when the
// caller should stop, or null to let the request continue.
async function handleRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!startsWithAny(request.nextUrl.pathname, AUTH_ROUTES)) return null;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new NextResponse("Too many requests", { status: 429 });
  }
  return null;
}

// Resolve the user and decide where the request goes. When a redirect is
// needed, `user` is null so the caller skips header injection and just returns
// the redirect.
async function handleAuth(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = startsWithAny(pathname, PUBLIC_ROUTES);
  const isAuthRoute = startsWithAny(pathname, AUTH_ROUTES);

  // Logged-out user hitting a protected route
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return { response: NextResponse.redirect(url), user: null };
  }
  // Logged-in user hitting login or signup
  if (user && isAuthRoute) {
    const url = new URL("/dashboard", request.url);
    return { response: NextResponse.redirect(url), user: null };
  }

  return { response: NextResponse.next(), user };
}

// Forward the user's identity to Server Components / actions. These are
// REQUEST headers, so they must be attached when the response is built — hence
// this returns a fresh NextResponse rather than mutating one in place.
function injectUserHeaders(request: NextRequest, user: User): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email ?? "");

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const start = Date.now();

  const rateLimitRes = await handleRateLimit(request);
  if (rateLimitRes) return rateLimitRes;

  const { response: authResponse, user } = await handleAuth(request);
  const response = user ? injectUserHeaders(request, user) : authResponse;

  const duration = Date.now() - start;
  console.log(`[mw] ${request.nextUrl.pathname} — ${duration}ms`);
  response.headers.set("x-middleware-duration", `${duration}ms`);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
