import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin-session";

// Single source of truth for validating the admin session, shared by both
// the page-protection and API-protection branches below so the check is
// never duplicated.
function hasValidAdminSession(request: NextRequest): boolean {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_SECRET_TOKEN;
  return Boolean(session && secret && session === secret);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the login page and the auth endpoint itself — these must stay
  // reachable while logged out (or logging out).
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  // Protect the admin data APIs. Previously only /admin/:path* pages were
  // guarded here; /api/admin/* was reachable by anyone regardless of session
  // state. Unauthenticated/invalid sessions get a 401 instead of a redirect,
  // since these are JSON endpoints, not page navigations.
  if (pathname.startsWith("/api/admin")) {
    if (!hasValidAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  // Protect the admin pages themselves.
  if (pathname.startsWith("/admin")) {
    if (!hasValidAdminSession(request)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
