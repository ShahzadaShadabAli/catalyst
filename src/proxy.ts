import { NextResponse, type NextRequest } from "next/server";

/**
 * Quick gate for /admin: no session cookie → login page.
 * This is only a fast first check. Every admin page, action and API route
 * verifies the cookie and the admin claim with Firebase on the server.
 */
const COOKIE = process.env.NODE_ENV === "production" ? "__Host-cc_session" : "cc_session";

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!req.cookies.get(COOKIE)?.value) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
