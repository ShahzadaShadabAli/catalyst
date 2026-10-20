# Setting up Catalyst Collective

This guide takes you from "code on my computer" to "live website with a working admin". It takes about 30 minutes the first time.

You'll need free accounts on **Firebase** (the database), **Cloudinary** (photos) and **Vercel** (hosting).

> On Windows PowerShell, if `npm` says "running scripts is disabled", type `npm.cmd` instead of `npm` in every command below.

---

## 1. Try it locally first (no accounts needed)

```bash
npm install
```

In one terminal, start the local database emulator (a fake Firestore that runs on your computer):

```bash
npm run emulators
```

In a second terminal, fill it with sample content and a test login:

```bash
npm run seed
```

Then start the site:

```bash
npm run dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin. Sign in with username `admin` and the password in `.env.local` (`SEED_ADMIN_PASSWORD`). It only works on your computer.

> The emulator forgets everything when you stop it. Run `npm run seed` again after restarting it.

---

## 2. Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it. Google Analytics is optional.
2. **Build → Firestore Database → Create database** → choose a location close to Pakistan (e.g. `asia-south1` Mumbai) → **Production mode**.
3. **Project settings (gear) → Service accounts → Generate new private key**. A JSON file downloads. **Keep it secret. Never commit it, email it or post it.**

That's all. You don't need Firebase Authentication or a "web app": logins are handled by the site itself (step 5).

### Deploy the security rules

The rules block all direct browser access to the database (the website's server does all reading and writing). New production-mode databases already block everything, but deploying keeps them in sync with the code:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID
```

### Optional: auto-clean old records

Firestore → **TTL policies** → **Create policy**, twice:
- collection `rateLimits`, field `expireAt`
- collection `adminSessions`, field `expireAt`

---

## 3. Create the Cloudinary account (photo uploads)

1. Sign up at https://cloudinary.com.
2. On the Dashboard → **API Keys**, copy the **Cloud name**, **API key** and **API secret**. The API secret is **secret**.
3. That's it. Uploads are signed by our server, so no "upload preset" is needed. The free plan caps images at 10 MB, which matches the limit in the admin.

---

## 4. Fill in your environment variables

Copy `.env.example` to **`.env.local`** and fill in `.env.local` (never `.env.example`, which goes to GitHub):

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your final web address, e.g. `https://catalystcollective.org` |
| `FIREBASE_PROJECT_ID` | `project_id` in the service-account JSON |
| `FIREBASE_CLIENT_EMAIL` | `client_email` in the JSON, copied exactly |
| `FIREBASE_PRIVATE_KEY` | `private_key` in the JSON, in double quotes |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Step 3 |
| `CLOUDINARY_FOLDER` | Any folder name, e.g. `catalyst-collective` |
| `RATE_LIMIT_SALT` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

Remove or comment out `FIRESTORE_EMULATOR_HOST` when you point at the real project.

---

## 5. Create the admin logins

Admins sign in at `/admin` with a **username and password**. They're stored in the `admins` table in your database, with the password saved only as a secure hash.

1. Add a line to `.env.local` with the password you want: `ADMIN_PASSWORD=your-password-here` (12+ characters).
2. Run, with the username you want:

```bash
npm run create-admin -- qarnia
```

3. **Delete the `ADMIN_PASSWORD` line** from `.env.local`.
4. Sign in at `/admin`.

(If you leave out `ADMIN_PASSWORD`, the command asks you to type the password instead, hidden.)

- **Forgot the password, or want to change it?** Do the same again. It replaces the password and signs that admin out everywhere.
- **Remove someone:** `npm run remove-admin -- qarnia`

### Optional: start with the sample content

```bash
npm run seed -- --production
```

This only fills sections that are empty. Every sample item is marked "(sample)", so replace them from `/admin` before you launch.

---

## 6. Deploy to Vercel

1. Put this folder in a GitHub repository (private is fine). `.gitignore` already keeps secrets out.
2. https://vercel.com → **Add New → Project** → import the repository.
3. **Settings → Environment Variables**: add every variable from step 4 (not `ADMIN_PASSWORD`, `SEED_ADMIN_PASSWORD` or the emulator one).
4. **Deploy**. Then add your domain under **Settings → Domains** and update `NEXT_PUBLIC_SITE_URL`.

---

## How the security works (short version)

- **Logins**: usernames and password hashes live in the `admins` table. Passwords are hashed with scrypt (salted, deliberately slow), never stored as plain text.
- **Sessions**: a successful login gets a random token in a 5-day `httpOnly`, `Secure`, `SameSite=Strict` cookie. The database stores only a hash of that token. Signing out deletes it. Changing a password or removing an admin ends all their sessions.
- **Every admin page, save and upload** re-checks the session against the database. The `/admin` redirect in `src/proxy.ts` is only a first check.
- **Login endpoint**: at most 10 tries per 15 minutes per visitor and 20 per username, same-origin requests only, the same generic error for a wrong username or a wrong password, and equal timing for both.
- **Database**: Firestore rules deny all browser access. Only the server reads and writes, after checking the session.
- **Validation**: every form is checked on the server with Zod (types, lengths, formats), whatever the browser sends.
- **Join form**: a hidden bot trap, a minimum fill time, and a limit of 3 applications per hour per visitor. Visitor IPs are stored only as salted one-way hashes.
- **Uploads**: the server signs each Cloudinary upload for admins only, locked to one folder and to image formats. The API secret never reaches the browser.
- **Headers**: Content-Security-Policy, HSTS, no framing, `nosniff`, a strict referrer policy and Permissions-Policy. Admin pages are `noindex` and never cached.
- **Text** from the admin is shown as plain text (no HTML), so it can't inject scripts.
- **Payments**: the site never processes money. It only displays bank details.

Run the security-rule tests any time:

```bash
npm run test:rules
```
