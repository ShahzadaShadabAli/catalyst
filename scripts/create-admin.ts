/**
 * Create an admin login, or reset its password:
 *   npm run create-admin -- qarnia
 *
 * The password comes from ADMIN_PASSWORD in .env.local if it's there
 * (delete that line afterwards). Otherwise you're asked to type it, hidden.
 */
import { createInterface } from "node:readline";
import { hashPassword, isValidUsername, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, normaliseUsername } from "../src/lib/password";
import { projectId, upsertAdmin, usingEmulator } from "./_admin";

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    const r = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    r._writeToOutput = (s: string) => {
      if (!muted) r.output.write(s);
      else if (s.includes("\n") || s.includes("\r")) r.output.write("\n");
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

async function readPassword(): Promise<string> {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv) {
    console.log("Using the password from ADMIN_PASSWORD in .env.local.");
    return fromEnv;
  }
  if (!process.stdin.isTTY) {
    console.error("Add ADMIN_PASSWORD=... to .env.local, or run this in a terminal to type the password.");
    process.exit(1);
  }
  const password = await askHidden(`Choose a password (${MIN_PASSWORD_LENGTH}+ characters): `);
  const again = await askHidden("Type it again: ");
  if (again !== password) {
    console.error("The passwords didn't match. Nothing was changed.");
    process.exit(1);
  }
  return password;
}

async function main() {
  const username = normaliseUsername(process.argv[2] ?? "");
  if (!isValidUsername(username)) {
    console.error("Usage: npm run create-admin -- <username>");
    console.error("Usernames are 3–32 characters: letters, numbers, dots, dashes or underscores.");
    process.exit(1);
  }

  console.log(`Setting up admin "${username}" on ${projectId}${usingEmulator ? " (local emulator)" : ""}.`);
  const password = await readPassword();
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    console.error(`The password must be ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters. Nothing was changed.`);
    process.exit(1);
  }

  const result = await upsertAdmin(username, await hashPassword(password));
  console.log(`${result === "created" ? "Admin created" : "Password updated"}. Sign in at /admin with username "${username}".`);
  if (process.env.ADMIN_PASSWORD) console.log("Now delete the ADMIN_PASSWORD line from .env.local.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
