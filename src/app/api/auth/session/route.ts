import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS, sessionCookieOptions } from "@/lib/auth";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";

const GENERIC = "Email or password is incorrect, or this account doesn't have admin access.";
const body = z.object({ idToken: z.string().min(20).max(4096) });

/** Exchange a fresh Firebase ID token for an httpOnly session cookie (admins only). */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isFirebaseConfigured()) return NextResponse.json({ error: "Login is not set up yet." }, { status: 503 });

  const limit = await rateLimit("login", hashIp(await clientIp()), 10, 15 * 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: GENERIC }, { status: 400 });

  try {
    const decoded = await adminAuth().verifyIdToken(parsed.data.idToken, true);
    // Only freshly signed-in admins can mint a session.
    const signedInSecondsAgo = Date.now() / 1000 - decoded.auth_time;
    if (decoded.admin !== true || signedInSecondsAgo > 5 * 60) {
      return NextResponse.json({ error: GENERIC }, { status: 401 });
    }
    const session = await adminAuth().createSessionCookie(parsed.data.idToken, { expiresIn: SESSION_MAX_AGE_MS });
    (await cookies()).set(SESSION_COOKIE, session, sessionCookieOptions);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }
}

/** Sign out: clear the cookie and revoke every session for this user. */
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  if (value && isFirebaseConfigured()) {
    try {
      const decoded = await adminAuth().verifySessionCookie(value);
      await adminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      /* already invalid */
    }
  }
  return NextResponse.json({ ok: true });
}
