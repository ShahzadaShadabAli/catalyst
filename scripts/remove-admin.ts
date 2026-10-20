/**
 * Remove an admin and sign them out everywhere:
 *   npm run remove-admin -- qarnia
 */
import { isValidUsername, normaliseUsername } from "../src/lib/password";
import { db, deleteSessions, projectId, usingEmulator } from "./_admin";

async function main() {
  const username = normaliseUsername(process.argv[2] ?? "");
  if (!isValidUsername(username)) {
    console.error("Usage: npm run remove-admin -- <username>");
    process.exit(1);
  }
  const ref = db.collection("admins").doc(username);
  if (!(await ref.get()).exists) {
    console.error(`No admin called "${username}" on ${projectId}.`);
    process.exit(1);
  }
  await deleteSessions(username);
  await ref.delete();
  console.log(`Removed "${username}" on ${projectId}${usingEmulator ? " (local emulator)" : ""}. They can no longer sign in.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
