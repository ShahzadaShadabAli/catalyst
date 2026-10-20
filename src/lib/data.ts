import "server-only";
import { unstable_cache } from "next/cache";
import type { z } from "zod";
import { adminDb, isFirebaseConfigured } from "./firebase/admin";
import {
  bankSchema,
  eventSchema,
  leaderSchema,
  memberSchema,
  noteSchema,
  siteSchema,
  supporterSchema,
  type BankAccount,
  type CollectionName,
  type Event,
  type Leader,
  type Member,
  type Note,
  type Site,
  type Supporter,
} from "./schemas";

/* Public, cached readers. Admin edits call updateTag(<collection>) to refresh them instantly. */

const HOUR = 3600;

/** Reads a collection and keeps only documents that pass the schema (unknown fields are dropped). */
export async function readCollection<S extends z.ZodTypeAny>(name: CollectionName, schema: S) {
  const snap = await adminDb().collection(name).get();
  const items: (z.infer<S> & { id: string })[] = [];
  for (const doc of snap.docs) {
    const parsed = schema.safeParse(doc.data());
    if (parsed.success) items.push({ ...(parsed.data as object), id: doc.id } as z.infer<S> & { id: string });
    else console.warn(`[data] skipped invalid ${name}/${doc.id}`);
  }
  return items.sort((a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0));
}

export async function readSite(): Promise<Site> {
  const snap = await adminDb().collection("settings").doc("site").get();
  const parsed = siteSchema.safeParse(snap.data() ?? {});
  return parsed.success ? parsed.data : siteSchema.parse({});
}

/** Cache successful reads only; if Firebase is down or not set up, render with a fallback. */
function cachedRead<T>(tag: string, read: () => Promise<T>, fallback: () => T) {
  const cached = unstable_cache(read, [`cc:${tag}`], { tags: [tag], revalidate: HOUR });
  return async (): Promise<T> => {
    if (!isFirebaseConfigured()) return fallback();
    try {
      return await cached();
    } catch (err) {
      console.error(`[data] failed to read ${tag}:`, (err as Error).message);
      return fallback();
    }
  };
}

export const getSite = cachedRead<Site>("site", readSite, () => siteSchema.parse({}));
export const getLeaders = cachedRead<Leader[]>("leaders", () => readCollection("leaders", leaderSchema), () => []);
export const getMembers = cachedRead<Member[]>(
  "members",
  // Gender is admin-only: blank it so it never reaches the public page data.
  async () =>
    (await readCollection("members", memberSchema)).filter((m) => m.visible).map((m) => ({ ...m, gender: "" as const })),
  () => [],
);
export const getEvents = cachedRead<Event[]>(
  "events",
  async () =>
    (await readCollection("events", eventSchema))
      .filter((e) => e.published)
      .sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order),
  () => [],
);
export const getNotes = cachedRead<Note[]>("notes", () => readCollection("notes", noteSchema), () => []);
export const getBankAccounts = cachedRead<BankAccount[]>(
  "bankAccounts",
  () => readCollection("bankAccounts", bankSchema),
  () => [],
);
export const getSupporters = cachedRead<Supporter[]>(
  "supporters",
  () => readCollection("supporters", supporterSchema),
  () => [],
);

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const events = await getEvents();
  return events.find((e) => e.slug === slug) ?? null;
}
