import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { adminDb, isFirebaseConfigured } from "./firebase/admin";
import { hashToken, newSessionToken } from "./password";

/*
 * Admin logins live in our own Firestore tables:
 *   admins/{username}          → { passwordHash, active, createdAt, lastLoginAt }
 *   adminSessions/{tokenHash}  → { username, expiresAt, expireAt }
 * The browser holds a random token in an httpOnly cookie; we store only its hash.
 */

const isProd = process.env.NODE_ENV === "production";
/** __Host- cookies must be Secure, path=/ and have no Domain, so they can't be set by subdomains. */
export const SESSION_COOKIE = isProd ? "__Host-cc_session" : "cc_session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export type AdminSession = { username: string };

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_MS / 1000,
};

/** Checks the session cookie against the sessions table, and that the admin still exists. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isFirebaseConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  try {
    const db = adminDb();
    const snap = await db.collection("adminSessions").doc(hashToken(token)).get();
    const s = snap.data() as { username?: string; expiresAt?: Timestamp } | undefined;
    if (!s?.username || !s.expiresAt || s.expiresAt.toMillis() < Date.now()) return null;
    const admin = await db.collection("admins").doc(s.username).get();
    if (!admin.exists || admin.get("active") === false) return null;
    return { username: s.username };
  } catch {
    return null;
  }
});

/** Start a session for an admin whose password has just been checked. */
export async function startAdminSession(username: string): Promise<void> {
  const token = newSessionToken();
  const expires = Timestamp.fromMillis(Date.now() + SESSION_MAX_AGE_MS);
  await adminDb()
    .collection("adminSessions")
    .doc(hashToken(token))
    .set({ username, createdAt: Timestamp.now(), expiresAt: expires, expireAt: expires });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions);
}

/** Sign out: delete this session and clear the cookie. */
export async function endAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  jar.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  if (token && isFirebaseConfigured()) {
    await adminDb().collection("adminSessions").doc(hashToken(token)).delete().catch(() => {});
  }
}

/** For admin pages: send anyone without a valid admin session to the login page. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For server actions and API routes: throw if the caller is not an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}
