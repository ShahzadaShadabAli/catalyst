"use server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/request";
import { applicationSchema, fieldErrors } from "@/lib/schemas";

export type JoinResult = { ok: true } | { ok: false; errors?: Record<string, string>; message?: string };

const FIELDS = ["type", "fullName", "dob", "education", "institution", "city", "email", "phone", "reason", "expertise"] as const;
const MIN_FILL_MS = 4000;

export async function submitApplication(input: unknown): Promise<JoinResult> {
  if (typeof input !== "object" || input === null) return { ok: false, message: "Something went wrong. Please try again." };
  const raw = input as Record<string, unknown>;

  // Bots: a hidden "website" field that people never see, and forms filled in faster than a human can type.
  // We pretend it worked so they don't learn to adapt.
  const startedAt = Number(raw.startedAt);
  if ((typeof raw.website === "string" && raw.website.trim() !== "") || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return { ok: true };
  }

  // Copy only the fields we expect, as bounded strings.
  const data: Record<string, string> = {};
  for (const key of FIELDS) {
    const v = raw[key];
    data[key] = typeof v === "string" ? v.slice(0, 2000) : "";
  }

  const parsed = applicationSchema.safeParse(data);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  if (!isFirebaseConfigured()) {
    return { ok: false, message: "Applications aren't open yet. Please message us on Instagram instead." };
  }

  try {
    const ipHash = hashIp(await clientIp());
    const limit = await rateLimit("join", ipHash, 3, 60 * 60);
    if (!limit.ok) {
      const mins = Math.max(1, Math.ceil(limit.retryAfter / 60));
      return { ok: false, message: `You've sent a few applications already. Please try again in about ${mins} minutes.` };
    }

    await adminDb()
      .collection("applications")
      .add({ ...parsed.data, email: parsed.data.email.toLowerCase(), status: "new", createdAt: FieldValue.serverTimestamp(), ipHash });
    return { ok: true };
  } catch (err) {
    console.error("[join] failed:", (err as Error).message);
    return { ok: false, message: "We couldn't send your application just now. Please try again in a moment." };
  }
}
