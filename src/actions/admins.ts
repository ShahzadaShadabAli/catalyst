"use server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { requireAdmin, roleOf, type AdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import {
  hashPassword,
  isValidUsername,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  normaliseUsername,
} from "@/lib/password";
import type { ActionResult } from "./admin";

/*
 * Only owners can add admins, and only the owner who added an admin can remove them.
 * Admins added here get role "admin", so they can't add or remove anyone themselves.
 */

const DENIED: ActionResult = { ok: false, error: "Only an owner can manage admins." };
const FAILED: ActionResult = { ok: false, error: "Something went wrong. Please try again." };

async function owner(): Promise<AdminSession | null> {
  try {
    const session = await requireAdmin();
    return session.role === "owner" ? session : null;
  } catch {
    return null;
  }
}

const newAdminSchema = z
  .object({
    username: z
      .string()
      .transform(normaliseUsername)
      .refine(isValidUsername, "3–32 characters: letters, numbers, dots, dashes or underscores, starting with a letter or number"),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`)
      .max(MAX_PASSWORD_LENGTH, `At most ${MAX_PASSWORD_LENGTH} characters`),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The passwords don't match" });

export async function createAdmin(input: unknown): Promise<ActionResult> {
  const session = await owner();
  if (!session) return DENIED;
  const parsed = newAdminSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? "_form")] ??= issue.message;
    return { ok: false, error: "Please fix the highlighted fields.", errors };
  }
  const { username, password } = parsed.data;
  try {
    const now = Timestamp.now();
    // create() fails if the username is already taken, so nobody can be overwritten.
    await adminDb()
      .collection("admins")
      .doc(username)
      .create({
        passwordHash: await hashPassword(password),
        active: true,
        role: "admin",
        createdBy: session.username,
        createdAt: now,
        updatedAt: now,
      });
    return { ok: true, id: username };
  } catch (err) {
    if ((err as { code?: number }).code === 6) {
      return { ok: false, error: "That username is taken.", errors: { username: "Already taken" } };
    }
    console.error("[admins] create failed:", (err as Error).message);
    return FAILED;
  }
}

export async function deleteAdmin(username: unknown): Promise<ActionResult> {
  const session = await owner();
  if (!session) return DENIED;
  const name = typeof username === "string" ? normaliseUsername(username) : "";
  if (!isValidUsername(name)) return { ok: false, error: "Invalid request." };
  try {
    const db = adminDb();
    const ref = db.collection("admins").doc(name);
    const snap = await ref.get();
    if (!snap.exists) return { ok: false, error: "That admin no longer exists." };
    if (roleOf(snap.get("role")) !== "admin" || snap.get("createdBy") !== session.username) {
      return { ok: false, error: "You can only remove admins you added." };
    }
    // Sign them out everywhere, then remove the login.
    const sessions = await db.collection("adminSessions").where("username", "==", name).get();
    const batch = db.batch();
    sessions.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(ref);
    await batch.commit();
    return { ok: true };
  } catch (err) {
    console.error("[admins] delete failed:", (err as Error).message);
    return FAILED;
  }
}
