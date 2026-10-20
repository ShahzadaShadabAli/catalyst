# Setting up Catalyst Collective

This guide takes you from "code on my computer" to "live website with a working admin". It takes about 30–45 minutes the first time.

You'll need free accounts on **Firebase** (database + logins), **Cloudinary** (photos) and **Vercel** (hosting).

---

## 1. Try it locally first (no accounts needed)

```bash
npm install
```

In one terminal, start the local Firebase emulators (a fake Firebase that runs on your computer):

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

Open http://localhost:3000. The admin is at http://localhost:3000/admin. The test login email and password are in `.env.local` (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). They only work on your computer.

> The emulator forgets everything when you stop it. Run `npm run seed` again after restarting it.

---

## 2. Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `catalyst-collective`). Google Analytics is optional.
2. **Build → Authentication → Get started → Email/Password → Enable** (leave "Email link" off).
3. **Authentication → Settings**:
   - **User actions**: untick **Enable create (sign-up)** so nobody can make an account on their own.
   - Make sure **Email enumeration protection** is on.
4. **Build → Firestore Database → Create database** → choose a location close to Pakistan (e.g. `asia-south1` Mumbai) → **Production mode**.
5. **Project settings (gear) → General → Your apps → Web (`</>`)** → register an app → copy the `apiKey`, `authDomain`, `projectId`, `appId`.
6. **Project settings → Service accounts → Generate new private key**. A JSON file downloads. **Keep it secret. Never commit it, email it or post it.**

### Deploy the security rules

The rules block all direct browser access to the database (the website's server does all reading and writing):

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID
```

### Optional: auto-clean rate-limit records

Firestore → **TTL policies** (under Indexes) → **Create policy** → collection `rateLimits`, field `expireAt`.

---

## 3. Create the Cloudinary account (photo uploads)

1. Sign up at https://cloudinary.com.
2. On the Dashboard → **API Keys**, copy the **Cloud name**, **API key** and **API secret**. The API secret is **secret**.
3. That's it. Uploads are signed by our server, so no "upload preset" is needed. The free plan caps images at 10 MB, which matches the limit in the admin.

---

## 4. Fill in your environment variables

Copy `.env.example` to `.env.local` (for local use against the real project) and fill it in:

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your final web address, e.g. `https://catalystcollective.org` |
| `NEXT_PUBLIC_FIREBASE_*` | Step 2.5 |
| `FIREBASE_PROJECT_ID` | Same as the project id |
| `FIREBASE_CLIENT_EMAIL` | `client_email` in the service-account JSON |
| `FIREBASE_PRIVATE_KEY` | `private_key` in the JSON, on one line, keeping the `\n`s, wrapped in quotes |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Step 3 |
| `CLOUDINARY_FOLDER` | Any folder name, e.g. `catalyst-collective` |
| `RATE_LIMIT_SALT` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Remove** `NEXT_PUBLIC_USE_EMULATORS`, `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` when you point at the real project.

---

## 5. Create the admin logins

1. Firebase console → **Authentication → Users → Add user** → enter the person's email and a strong password (12+ characters).
2. Give them admin rights (from this folder, with `.env.local` pointing at the real project):

```bash
npm run set-admin -- person@example.com
```

To remove someone's access: `npm run set-admin -- person@example.com --revoke`. This also signs them out everywhere.

Only people with admin rights can sign in to `/admin`. Anyone else is refused, even if they have a Firebase account.

### Optional: start with the sample content

```bash
npm run seed -- --production
```

This only fills sections that are empty. Every sample item is marked "(sample)", so replace them from `/admin` before you launch.

---

## 6. Deploy to Vercel

1. Put this folder in a GitHub repository (private is fine). `.gitignore` already keeps secrets out.
2. https://vercel.com → **Add New → Project** → import the repository.
3. **Settings → Environment Variables**: add every variable from step 4 (not the emulator ones).
4. **Deploy**. Then add your domain under **Settings → Domains** and update `NEXT_PUBLIC_SITE_URL`.

---

## How the security works (short version)

- **Logins**: Firebase Auth checks the password. The server then issues a 5-day, `httpOnly`, `Secure`, `SameSite=Strict` session cookie, and only to accounts with the `admin` claim who signed in within the last 5 minutes. Signing out revokes the session everywhere.
- **Every admin page, save and upload** re-checks that cookie with Firebase, including revocation. The `/admin` redirect in `src/proxy.ts` is only a first check.
- **Database**: Firestore rules deny all browser access. Only the server (Admin SDK) reads and writes, after checking the session.
- **Validation**: every form is checked on the server with Zod (types, lengths, formats), whatever the browser sends.
- **Join form**: a hidden bot trap, a minimum fill time, and a limit of 3 applications per hour per visitor. Visitor IPs are stored only as salted one-way hashes.
- **Login endpoint**: at most 10 tries per 15 minutes per visitor, same-origin requests only, and generic error messages that don't reveal which emails exist.
- **Uploads**: the server signs each Cloudinary upload for admins only, locked to one folder and to image formats. The API secret never reaches the browser.
- **Headers**: Content-Security-Policy, HSTS, no framing, `nosniff`, a strict referrer policy and Permissions-Policy. Admin pages are `noindex` and never cached.
- **Text** from the admin is shown as plain text (no HTML), so it can't inject scripts.
- **Payments**: the site never processes money. It only displays bank details.

Run the security-rule tests any time:

```bash
npm run test:rules
```
