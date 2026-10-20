"use server";
import { FieldValue } from "firebase-admin/firestore";
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin, type AdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import {
  applicationStatuses,
  collectionNames,
  collectionSchemas,
  fieldErrors,
  siteSchema,
  type CollectionName,
} from "@/lib/schemas";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string; errors?: Record<string, string> };

const collectionArg = z.enum(collectionNames as [CollectionName, ...CollectionName[]]);
const idArg = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

const DENIED: ActionResult = { ok: false, error: "Your session has expired. Please sign in again." };
const FAILED: ActionResult = { ok: false, error: "Something went wrong saving that. Please try again." };

async function admin(): Promise<AdminSession | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

const stamp = (s: AdminSession) => ({ updatedAt: FieldValue.serverTimestamp(), updatedBy: s.username });

/** Would making `parentId` the parent of `id` create a loop? */
async function createsCycle(id: string | null, parentId: string | null): Promise<boolean> {
  if (!parentId) return false;
  if (parentId === id) return true;
  const snap = await adminDb().collection("leaders").get();
  const parents = new Map(snap.docs.map((d) => [d.id, (d.get("parentId") as string | null) ?? null]));
  if (!parents.has(parentId)) return true; // unknown parent
  let cursor: string | null = parentId;
  for (let i = 0; cursor && i < 200; i++) {
    if (cursor === id) return true;
    cursor = parents.get(cursor) ?? null;
  }
  return false;
}

export async function saveItem(collection: unknown, id: unknown, payload: unknown): Promise<ActionResult> {
  const session = await admin();
  if (!session) return DENIED;
  const name = collectionArg.safeParse(collection);
  const docId = id === null ? { success: true as const, data: null } : idArg.safeParse(id);
  if (!name.success || !docId.success) return { ok: false, error: "Invalid request." };

  const parsed = collectionSchemas[name.data].safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data as Record<string, unknown>;
  const col = adminDb().collection(name.data);

  try {
    if (name.data === "events") {
      const clash = await col.where("slug", "==", data.slug).limit(2).get();
      if (clash.docs.some((d) => d.id !== docId.data)) {
        return { ok: false, error: "Another event already uses that link.", errors: { slug: "Already used by another event" } };
      }
    }
    if (name.data === "leaders" && (await createsCycle(docId.data, data.parentId as string | null))) {
      return { ok: false, error: "That would make someone report to themselves.", errors: { parentId: "Pick a different person" } };
    }

    let savedId = docId.data;
    if (savedId) {
      const ref = col.doc(savedId);
      if (!(await ref.get()).exists) return { ok: false, error: "That item no longer exists." };
      await ref.set({ ...data, ...stamp(session) });
    } else {
      const last = await col.orderBy("order", "desc").limit(1).get();
      const nextOrder = last.empty ? 0 : Number(last.docs[0]!.get("order") ?? 0) + 1;
      const ref = await col.add({ ...data, order: nextOrder, ...stamp(session) });
      savedId = ref.id;
    }
    updateTag(name.data);
    return { ok: true, id: savedId };
  } catch (err) {
    console.error("[admin] save failed:", (err as Error).message);
    return FAILED;
  }
}

export async function deleteItem(collection: unknown, id: unknown): Promise<ActionResult> {
  const session = await admin();
  if (!session) return DENIED;
  const name = collectionArg.safeParse(collection);
  const docId = idArg.safeParse(id);
  if (!name.success || !docId.success) return { ok: false, error: "Invalid request." };

  try {
    const db = adminDb();
    const ref = db.collection(name.data).doc(docId.data);
    const batch = db.batch();
    if (name.data === "leaders") {
      // Move anyone who reported to this person up one level.
      const parentId = ((await ref.get()).get("parentId") as string | null) ?? null;
      const children = await db.collection("leaders").where("parentId", "==", docId.data).get();
      children.docs.forEach((c) => batch.update(c.ref, { parentId, ...stamp(session) }));
    }
    batch.delete(ref);
    await batch.commit();
    updateTag(name.data);
    return { ok: true };
  } catch (err) {
    console.error("[admin] delete failed:", (err as Error).message);
    return FAILED;
  }
}

export async function reorderItems(collection: unknown, ids: unknown): Promise<ActionResult> {
  const session = await admin();
  if (!session) return DENIED;
  const name = collectionArg.safeParse(collection);
  const list = z.array(idArg).max(500).safeParse(ids);
  if (!name.success || !list.success) return { ok: false, error: "Invalid request." };

  try {
    const db = adminDb();
    const batch = db.batch();
    list.data.forEach((docId, i) => batch.update(db.collection(name.data).doc(docId), { order: i }));
    await batch.commit();
    updateTag(name.data);
    return { ok: true };
  } catch (err) {
    console.error("[admin] reorder failed:", (err as Error).message);
    return FAILED;
  }
}

export async function saveSite(payload: unknown): Promise<ActionResult> {
  const session = await admin();
  if (!session) return DENIED;
  const parsed = siteSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  try {
    await adminDb().collection("settings").doc("site").set({ ...parsed.data, ...stamp(session) });
    updateTag("site");
    return { ok: true };
  } catch (err) {
    console.error("[admin] site save failed:", (err as Error).message);
    return FAILED;
  }
}

export async function setApplicationStatus(id: unknown, status: unknown): Promise<ActionResult> {
  const session = await admin();
  if (!session) return DENIED;
  const docId = idArg.safeParse(id);
  const s = z.enum(applicationStatuses).safeParse(status);
  if (!docId.success || !s.success) return { ok: false, error: "Invalid request." };
  try {
    await adminDb().collection("applications").doc(docId.data).update({ status: s.data, ...stamp(session) });
    return { ok: true };
  } catch {
    return FAILED;
  }
}

export async function deleteApplication(id: unknown): Promise<ActionResult> {
  const session = await admin();
  if (!session) return DENIED;
  const docId = idArg.safeParse(id);
  if (!docId.success) return { ok: false, error: "Invalid request." };
  try {
    await adminDb().collection("applications").doc(docId.data).delete();
    return { ok: true };
  } catch {
    return FAILED;
  }
}
