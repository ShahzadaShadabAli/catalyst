/**
 * Give (or take away) admin access.
 *   npm run set-admin -- person@example.com
 *   npm run set-admin -- person@example.com --revoke
 * The person must already exist in Firebase Authentication (add them in the console).
 */
import { auth, projectId, usingEmulator } from "./_admin";

async function main() {
  const email = process.argv[2];
  const revoke = process.argv.includes("--revoke");
  if (!email || !email.includes("@")) {
    console.error("Usage: npm run set-admin -- person@example.com [--revoke]");
    process.exit(1);
  }

  const user = await auth.getUserByEmail(email);
  const claims = { ...(user.customClaims ?? {}) };
  if (revoke) delete claims.admin;
  else claims.admin = true;

  await auth.setCustomUserClaims(user.uid, claims);
  // Sign them out everywhere so the change takes effect on their next login.
  await auth.revokeRefreshTokens(user.uid);

  console.log(
    `${revoke ? "Removed admin access from" : "Granted admin access to"} ${email} on ${projectId}${usingEmulator ? " (emulator)" : ""}.`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
