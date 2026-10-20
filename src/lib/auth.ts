import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, isFirebaseConfigured } from "./firebase/admin";

const isProd = process.env.NODE_ENV === "production";
/** __Host- cookies must be Secure, path=/ and have no Domain, so they can't be set by subdomains. */
export const SESSION_COOKIE = isProd ? "__Host-cc_session" : "cc_session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export type AdminSession = { uid: string; email: string };

/** Verifies the session cookie (including revocation) and the admin claim. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isFirebaseConfigured()) return null;
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(value, true);
    if (decoded.admin !== true) return null;
    return { uid: decoded.uid, email: decoded.email ?? "" };
  } catch {
    return null;
  }
});

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

export const sessionCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_MS / 1000,
};
