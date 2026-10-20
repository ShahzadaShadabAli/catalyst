import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

/** True when the server has what it needs to reach Firestore (real project or local emulator). */
export function isFirebaseConfigured(): boolean {
  return Boolean(projectId && (usingEmulator || (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)));
}

function app(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Admin is not configured. See SETUP.md.");
  }
  if (usingEmulator) return initializeApp({ projectId });
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\n/g, "\n"),
    }),
    projectId,
  });
}

// Several server bundles share one Firestore instance, so remember the setup on globalThis.
const g = globalThis as typeof globalThis & { __ccFirestoreReady?: boolean };
export function adminDb() {
  const db = getFirestore(app());
  if (!g.__ccFirestoreReady) {
    g.__ccFirestoreReady = true;
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      /* already configured by another bundle */
    }
  }
  return db;
}

