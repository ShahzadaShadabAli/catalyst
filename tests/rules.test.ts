import { readFileSync } from "node:fs";
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, collection, setDoc, deleteDoc } from "firebase/firestore";
import { afterAll, beforeAll, describe, it } from "vitest";

// The browser must never touch Firestore directly; all access goes through the server.
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-catalyst-rules",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "events/e1"), { title: "Clean-up", published: true });
    await setDoc(doc(ctx.firestore(), "applications/a1"), { fullName: "Someone", email: "x@y.z" });
  });
});

afterAll(async () => {
  await env?.cleanup();
});

const collections = ["settings", "leaders", "members", "events", "notes", "bankAccounts", "supporters", "upcoming", "applications", "rateLimits", "admins", "adminSessions"];

describe("firestore.rules", () => {
  it("visitors cannot read applications", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "applications/a1")));
    await assertFails(getDocs(collection(db, "applications")));
  });

  it("even a signed-in admin cannot read applications from the browser", async () => {
    const db = env.authenticatedContext("admin1", { admin: true }).firestore();
    await assertFails(getDoc(doc(db, "applications/a1")));
  });

  it("nobody can write any collection from the browser", async () => {
    const anon = env.unauthenticatedContext().firestore();
    const admin = env.authenticatedContext("admin1", { admin: true }).firestore();
    for (const name of collections) {
      await assertFails(setDoc(doc(anon, `${name}/x`), { hacked: true }));
      await assertFails(setDoc(doc(admin, `${name}/x`), { hacked: true }));
    }
    await assertFails(deleteDoc(doc(admin, "events/e1")));
  });

  it("public content is not readable directly either (served by the server)", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "events/e1")));
  });
});
