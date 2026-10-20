// Firebase Admin for command-line scripts (the app's version is server-only).
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
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
export const auth = getAuth();
export { projectId };
