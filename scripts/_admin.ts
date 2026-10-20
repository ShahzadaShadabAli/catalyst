// Firebase Admin for command-line scripts (the app's version is server-only).
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
export const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (!projectId) {
  console.error("FIREBASE_PROJECT_ID is not set. Fill in .env.local first (see SETUP.md).");
  process.exit(1);
}

if (!getApps().length) {
  if (usingEmulator) {
    initializeApp({ projectId });
  } else {
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error("FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are missing in .env.local.");
      process.exit(1);
    }
    initializeApp({
      credential: cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      projectId,
    });
  }
}

export const db = getFirestore();
export { projectId };

/** Create an admin, or reset an existing admin's password (and sign them out everywhere). */
export async function upsertAdmin(username: string, passwordHash: string): Promise<"created" | "updated"> {
  const ref = db.collection("admins").doc(username);
  const existed = (await ref.get()).exists;
  const now = new Date();
  await ref.set(
    existed ? { passwordHash, active: true, updatedAt: now } : { passwordHash, active: true, createdAt: now, updatedAt: now },
    { merge: true },
  );
  await deleteSessions(username);
  return existed ? "updated" : "created";
}

export async function deleteSessions(username: string): Promise<void> {
  const sessions = await db.collection("adminSessions").where("username", "==", username).get();
  if (sessions.empty) return;
  const batch = db.batch();
  sessions.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
