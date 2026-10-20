import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** Best-effort client IP. On Vercel, x-forwarded-for is set by the platform. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** One-way hash so raw IP addresses are never stored. */
export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt && process.env.NODE_ENV === "production") throw new Error("RATE_LIMIT_SALT is not set");
  return createHash("sha256").update(`${salt ?? "dev-salt"}:${ip}`).digest("hex");
}

/** Rejects cross-site requests to route handlers (server actions do this check on their own). */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
