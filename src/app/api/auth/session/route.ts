import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { endAdminSession, startAdminSession } from "@/lib/auth";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { dummyHash, isValidUsername, MAX_PASSWORD_LENGTH, normaliseUsername, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";

const GENERIC = "Username or password is incorrect.";
const body = z.object({
  username: z.string().max(64),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

/** Check username + password against the admins table and start a session. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isFirebaseConfigured()) return NextResponse.json({ error: "Login is not set up yet." }, { status: 503 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: GENERIC }, { status: 400 });
  const username = normaliseUsername(parsed.data.username);

  // Slow down guessing: per visitor, and per username (so many machines can't hammer one account).
  const tooMany = (retryAfter: number) =>
    NextResponse.json(
      { error: "Too many sign-in attempts. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  const byIp = await rateLimit("login-ip", hashIp(await clientIp()), 10, 15 * 60);
  if (!byIp.ok) return tooMany(byIp.retryAfter);
  const byUser = await rateLimit("login-user", username, 20, 15 * 60);
  if (!byUser.ok) return tooMany(byUser.retryAfter);

  try {
    const ref = isValidUsername(username) ? adminDb().collection("admins").doc(username) : null;
    const admin = ref ? await ref.get() : null;
    const stored = admin?.exists && admin.get("active") !== false ? String(admin.get("passwordHash") ?? "") : "";
    // Always run a full hash check so "no such user" and "wrong password" take the same time.
    const ok = await verifyPassword(parsed.data.password, stored || (await dummyHash()));
    if (!ok || !stored || !ref) return NextResponse.json({ error: GENERIC }, { status: 401 });

    await startAdminSession(username);
    await ref.update({ lastLoginAt: Timestamp.now() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[login] failed:", (err as Error).message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/** Sign out. */
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await endAdminSession();
  return NextResponse.json({ ok: true });
}
