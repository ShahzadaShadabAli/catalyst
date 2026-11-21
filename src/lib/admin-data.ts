import "server-only";
import type { Timestamp } from "firebase-admin/firestore";
import { roleOf, type AdminRole } from "./auth";
import { readCollection, readSite } from "./data";
import { adminDb } from "./firebase/admin";
import {
  applicationStatuses,
  collectionSchemas,
  type Application,
  type BankAccount,
  type Event,
  type Leader,
  type Member,
  type Note,
  type Supporter,
  type Upcoming,
  type ApplicationStatus,
  type CollectionName,
} from "./schemas";

/* Fresh, uncached reads for the admin dashboard. Call only after requireAdminPage(). */

type ItemOf = { leaders: Leader; members: Member; events: Event; notes: Note; bankAccounts: BankAccount; supporters: Supporter; upcoming: Upcoming };
export const adminList = async <C extends CollectionName>(name: C): Promise<ItemOf[C][]> =>
  (await readCollection(name, collectionSchemas[name])) as unknown as ItemOf[C][];
export const adminSite = readSite;

export async function adminApplications(): Promise<Application[]> {
  const snap = await adminDb().collection("applications").orderBy("createdAt", "desc").limit(1000).get();
  return snap.docs.map((d) => {
    const v = d.data();
    const status = (applicationStatuses as readonly string[]).includes(v.status) ? (v.status as ApplicationStatus) : "new";
    return {
      id: d.id,
      type: v.type === "honorary" ? "honorary" : "permanent",
      fullName: String(v.fullName ?? ""),
      dob: String(v.dob ?? ""),
      education: v.education,
      institution: String(v.institution ?? ""),
      city: String(v.city ?? ""),
      email: String(v.email ?? ""),
      phone: String(v.phone ?? ""),
      reason: String(v.reason ?? ""),
      expertise: String(v.expertise ?? ""),
      status,
      createdAt: (v.createdAt as Timestamp | undefined)?.toDate().toISOString() ?? "",
    };
  });
}

export async function adminCounts() {
  const db = adminDb();
  const [newApps, totalApps, events, members, leaders] = await Promise.all([
    db.collection("applications").where("status", "==", "new").count().get(),
    db.collection("applications").count().get(),
    db.collection("events").count().get(),
    db.collection("members").count().get(),
    db.collection("leaders").count().get(),
  ]);
  return {
    newApps: newApps.data().count,
    totalApps: totalApps.data().count,
    events: events.data().count,
    members: members.data().count,
    leaders: leaders.data().count,
  };
}

export type AdminUser = {
  username: string;
  role: AdminRole;
  createdBy: string | null;
  createdAt: string;
  lastLoginAt: string;
};

/** Everyone who can sign in to the admin. Never includes password hashes. Owners only. */
export async function adminUsers(): Promise<AdminUser[]> {
  const snap = await adminDb().collection("admins").get();
  const iso = (v: unknown) => (v && typeof (v as Timestamp).toDate === "function" ? (v as Timestamp).toDate().toISOString() : v instanceof Date ? v.toISOString() : "");
  return snap.docs
    .map((d) => ({
      username: d.id,
      role: roleOf(d.get("role")),
      createdBy: typeof d.get("createdBy") === "string" ? (d.get("createdBy") as string) : null,
      createdAt: iso(d.get("createdAt")),
      lastLoginAt: iso(d.get("lastLoginAt")),
    }))
    .sort((a, b) => (a.role === b.role ? a.username.localeCompare(b.username) : a.role === "owner" ? -1 : 1));
}
