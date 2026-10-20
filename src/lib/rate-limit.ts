import "server-only";
import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase/admin";

/**
 * Fixed-window rate limit stored in Firestore (works across serverless instances).
 * `key` should already be non-identifying (e.g. a hashed IP).
 * Old docs carry `expireAt` so a Firestore TTL policy can clean them up.
 */
export async function rateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  const id = createHash("sha256").update(`${bucket}:${key}`).digest("hex");
  const ref = adminDb().collection("rateLimits").doc(id);
  const now = Date.now();

  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as { count: number; resetAt: number } | undefined;
    if (!data || data.resetAt <= now) {
      const resetAt = now + windowSeconds * 1000;
      tx.set(ref, { bucket, count: 1, resetAt, expireAt: Timestamp.fromMillis(resetAt + 86_400_000) });
      return { ok: true, retryAfter: 0 };
    }
    if (data.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((data.resetAt - now) / 1000) };
    }
    tx.update(ref, { count: data.count + 1 });
    return { ok: true, retryAfter: 0 };
  });
}
