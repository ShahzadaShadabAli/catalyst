# Catalyst Collective

Website and admin dashboard for **Catalyst Collective**, a teenage, women-led organisation in Skardu, Gilgit-Baltistan.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Motion + Lenis · Firestore (Admin SDK on the server) with its own username + password admin login · Cloudinary · Zod

👉 **First time? Read [SETUP.md](SETUP.md).**

## What's inside

**Public site** (`/`, one long scrolling page):
Hero · 01 Origin · 02 Mission · 03 Leadership tree · 04 Members · 05 Works · 06 A note from the leadership · 07 Support (bank cards) · 08 Join us · 09 Supported by · Footer

**Event pages** (`/works/[slug]`): the story, "What locals said" sticky notes, and a gallery of photos and YouTube videos with a lightbox.

**Admin** (`/admin`, admins only): Applications inbox (filter, accept/reject, CSV export), Upcoming popup (an activity that pops up when the site opens, between the dates you pick), Works, Leadership, Members, Leadership notes, Bank details, Supported by, Site settings.

## Commands

| | |
|---|---|
| `npm run emulators` | Local Firebase (Auth + Firestore) |
| `npm run seed` | Sample content + test logins (emulator) |
| `npm run dev` | Dev server on :3000 |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run test:rules` | Firestore security-rule tests |
| `npm run create-admin -- username` | Create an admin login (or reset its password) |
| `npm run remove-admin -- username` | Remove an admin |

## Where things live

```
src/app/(site)/          public pages
src/app/admin/           login + dashboard
src/app/api/             session login/logout, Cloudinary signing, CSV export
src/actions/             server actions (join form, admin saves)
src/components/craft/    tape, pins, polaroids, sticky notes
src/components/sections/ the home-page sections
src/components/admin/    dashboard UI
src/lib/                 schemas, data readers, auth, rate limiting
firestore.rules          deny-all browser access
```

## Brand

Sage `#7B8F55` / deep sage `#4E6136` · charcoal `#4A4A4A` · paper `#F5F3EC` · kraft `#D9C7A3` · blush `#F3C6CF`.
Fonts: Fraunces, Inter, JetBrains Mono, Caveat. The logo files in `public/brand/` were cut from a screenshot. Swap in the original logo files when you have them.
