/**
 * Fills Firestore with SAMPLE content so the site has something to show.
 *   npm run seed                  → local emulator (also creates test logins)
 *   npm run seed -- --production  → a real project; only fills collections that are empty
 * Replace every sample entry from the admin dashboard before launch.
 */
import { FieldValue } from "firebase-admin/firestore";
import {
  bankSchema,
  eventSchema,
  leaderSchema,
  memberSchema,
  noteSchema,
  siteSchema,
  supporterSchema,
} from "../src/lib/schemas";
import { auth, db, projectId, usingEmulator } from "./_admin";

const allowProduction = process.argv.includes("--production");
if (!usingEmulator && !allowProduction) {
  console.error(`Refusing to seed the real project "${projectId}". Re-run with --production if you really mean it.`);
  process.exit(1);
}

const stamp = { updatedAt: FieldValue.serverTimestamp(), updatedBy: "seed" };

const site = siteSchema.parse({
  hero: {
    eyebrow: "Est. Skardu · Gilgit-Baltistan",
    titleLine1: "Empowering people.",
    titleLine2: "Transforming communities.",
    subtitle:
      "We're a teenage, women-led collective doing small, brave, hands-on things for Skardu — one clean-up, workshop and conversation at a time.",
  },
  origin: {
    title: "It started with a few girls and one big question: why not us?",
    text:
      "Catalyst Collective began in Skardu when a handful of school and college girls got tired of waiting for someone else to fix the things we cared about.\n\nWe started small — picking up litter on the roads we walk every day, swapping skills in borrowed rooms, talking openly about things people usually whisper about. People noticed. Friends joined. Families started asking how they could help.\n\n(Sample text — replace this story from the admin dashboard.)",
    images: [],
  },
  mission: {
    title: "Give every young woman in Gilgit-Baltistan the room, the skills and the courage to lead.",
    text:
      "We organise community clean-ups, creative and skills workshops, and awareness sessions — designed and run by young women, for everyone. Every project leaves something behind: a cleaner street, a new skill, a braver voice.",
    image: { url: "/brand/logo-round.png", alt: "Catalyst Collective logo" },
    values: [
      { title: "Show up", text: "Small actions, done consistently, change places." },
      { title: "Make space", text: "Every girl's idea deserves a room to grow in." },
      { title: "Learn by doing", text: "Workshops over lectures, hands over handouts." },
      { title: "Stay local", text: "Rooted in Skardu, built with the people here." },
    ],
  },
  join: {
    permanentText:
      "For students and young women who want to be part of the core team — planning events, volunteering on the ground and growing with us every month.",
    honoraryText:
      "For mentors, professionals and well-wishers who want to lend their expertise, network or voice without a regular time commitment.",
  },
  support: {
    intro:
      "Every rupee goes into materials, transport and workshop supplies. We never handle money on this website — transfer directly to one of our accounts below and send us the receipt so we can say thank you.",
  },
  socials: { instagram: "https://www.instagram.com/catalyst.collective.official/" },
  location: "Skardu, Gilgit-Baltistan",
  foundedYear: "2025",
});

const leaders = [
  { key: "founder", name: "Zainab", role: "Founder & President", parent: null, bio: "Started it all with a notebook and a group chat." },
  { key: "vp", name: "Maryam", role: "Vice President", parent: "founder", bio: "" },
  { key: "gs", name: "Fatima", role: "General Secretary", parent: "founder", bio: "" },
  { key: "events", name: "Hira", role: "Events Lead", parent: "vp", bio: "" },
  { key: "outreach", name: "Amna", role: "Outreach Lead", parent: "vp", bio: "" },
  { key: "media", name: "Noor", role: "Media & Design", parent: "gs", bio: "" },
  { key: "finance", name: "Iqra", role: "Finance", parent: "gs", bio: "" },
];

const members = [
  ['Sana', 'Volunteer', 'permanent', 'female', 'I wanted to stop complaining about the litter and actually do something.'],
  ['Rabia', 'Volunteer', 'permanent', 'female', 'Because girls in Skardu deserve a room of our own to dream in.'],
  ['Kulsoom', 'Photography', 'permanent', 'female', 'Someone has to capture all of this!'],
  ['Laiba', 'Volunteer', 'permanent', 'female', 'My friends were here, and then it became my thing too.'],
  ['Mehwish', 'Workshops', 'permanent', 'female', 'I love teaching what I know. Here, everyone listens.'],
  ['Areeba', 'Volunteer', 'permanent', '', 'To be brave in small ways, every week.'],
  ['Dr. Saima', 'Mentor', 'honorary', 'female', 'These girls remind me why I studied medicine in the first place.'],
  ['Ms. Shabana', 'Advisor', 'honorary', 'female', 'I wish this had existed when I was fifteen.'],
] as const;

const events = [
  {
    title: "Catalyst × Yarnive Workshop",
    slug: "catalyst-x-yarnive-workshop",
    date: "2026-09-27",
    location: "Bzangmo, near Dolti Hospital, Skardu",
    summary: "A first for Skardu: an afternoon of punch-needle, quilting and yarn art with our friends at Yarnive.",
    story:
      "On a Sunday afternoon we turned a quiet room in Bzangmo into a craft studio. Twenty-odd girls, most of whom had never held a punch needle, left with a finished piece and a new favourite hobby.\n\nYarnive brought the materials and the patience; we brought snacks, music and a lot of enthusiasm. Some of the work was wonky, all of it was proud.\n\n(Sample story — replace from the admin dashboard.)",
    cover: { url: "/seed/yarnive-workshop-poster.webp", alt: "Workshop poster: First time in Skardu, Catalyst x Yarnive" },
    testimonials: [
      { quote: "My daughter hasn't stopped talking about it. She wants to teach her cousins now.", name: "A parent", role: "Skardu" },
      { quote: "I didn't know I could make something this pretty with my own hands.", name: "Workshop participant", role: "Age 15" },
    ],
    media: [
      { kind: "image" as const, image: { url: "/seed/yarnive-workshop-poster.webp", alt: "Workshop poster" }, caption: "The poster that started it" },
      { kind: "youtube" as const, youtubeId: "jNQXAC9IVRw", caption: "Sample video — replace with your own YouTube link" },
    ],
  },
  {
    title: "Satpara Road Clean-up Drive",
    slug: "satpara-road-clean-up-drive",
    date: "2026-06-05",
    location: "Satpara Road, Skardu",
    summary: "Gloves on, bags out: forty volunteers cleared two kilometres of roadside on World Environment Day.",
    story:
      "We met at 8 am with gloves, rubbish bags and a borrowed wheelbarrow. By noon we had cleared two kilometres of roadside and sorted what could be recycled.\n\nShopkeepers brought us tea. A few kids from the neighbourhood joined halfway and refused to leave until the end.\n\n(Sample story — replace from the admin dashboard.)",
    cover: { url: "", alt: "" },
    testimonials: [
      { quote: "I've lived on this road for thirty years. I have never seen young girls do this. Shabash!", name: "Shopkeeper", role: "Satpara Road" },
      { quote: "Next time, tell us earlier — the whole mohalla will come.", name: "Local resident", role: "" },
      { quote: "It felt good to see the road clean on my way to school.", name: "Student", role: "Grade 8" },
    ],
    media: [],
  },
];

const notes = [
  {
    quote: "We didn't wait to be old enough or important enough. We just started — and the town started with us.",
    body: "Zainab, Founder & President. Catalyst Collective brings young women in Skardu together to clean, create, learn and lead. (Sample note.)",
    authorName: "Zainab",
    authorRole: "Founder & President",
  },
  {
    quote: "Every workshop ends with someone saying 'I didn't know I could do that.' That sentence is why we exist.",
    body: "Maryam, Vice President, on why hands-on learning is at the heart of everything we do. (Sample note.)",
    authorName: "Maryam",
    authorRole: "Vice President",
  },
];

const banks = [
  {
    kind: "bank" as const,
    bankName: "Meezan Bank (sample)",
    accountTitle: "Catalyst Collective",
    accountNumber: "0000 0000 0000 00",
    iban: "PK00MEZN0000000000000000",
    branch: "Skardu Main Branch",
    swift: "MEZNPKKA",
    note: "Sample details — replace before launch.",
  },
  {
    kind: "wallet" as const,
    bankName: "JazzCash (sample)",
    accountTitle: "Catalyst Collective",
    accountNumber: "0300 0000000",
    note: "Sample details — replace before launch.",
  },
];

const supporters = [
  { name: "Yarnive", blurb: "Workshop partner — yarn, needles and endless patience." },
  { name: "Your organisation here", blurb: "Want to back young women in GB? Get in touch." },
];

async function isEmpty(name: string) {
  const snap = await db.collection(name).limit(1).get();
  return snap.empty;
}

async function seedCollection<T>(name: string, rows: T[]) {
  if (!(await isEmpty(name))) {
    console.log(`· ${name}: already has data, skipped`);
    return;
  }
  const batch = db.batch();
  rows.forEach((row) => batch.set(db.collection(name).doc(), { ...row, ...stamp }));
  await batch.commit();
  console.log(`✓ ${name}: ${rows.length}`);
}

async function main() {
  console.log(`Seeding SAMPLE content into ${projectId}${usingEmulator ? " (emulator)" : ""}…`);

  const siteRef = db.collection("settings").doc("site");
  if (!(await siteRef.get()).exists) {
    await siteRef.set({ ...site, ...stamp });
    console.log("✓ settings/site");
  } else console.log("· settings/site: already exists, skipped");

  // Leaders need stable ids so children can point at parents.
  if (await isEmpty("leaders")) {
    const ids = new Map(leaders.map((l) => [l.key, db.collection("leaders").doc().id]));
    const batch = db.batch();
    leaders.forEach((l, i) => {
      const data = leaderSchema.parse({
        name: l.name,
        role: l.role,
        bio: l.bio,
        parentId: l.parent ? ids.get(l.parent)! : null,
        order: i,
      });
      batch.set(db.collection("leaders").doc(ids.get(l.key)!), { ...data, ...stamp });
    });
    await batch.commit();
    console.log(`✓ leaders: ${leaders.length}`);
  } else console.log("· leaders: already has data, skipped");

  await seedCollection(
    "members",
    members.map(([name, role, type, gender, quote], i) =>
      memberSchema.parse({ name, role, type, gender, quote, joinedYear: 2025, order: i }),
    ),
  );
  await seedCollection("events", events.map((e, i) => eventSchema.parse({ ...e, order: i })));
  await seedCollection("notes", notes.map((n, i) => noteSchema.parse({ ...n, order: i })));
  await seedCollection("bankAccounts", banks.map((b, i) => bankSchema.parse({ ...b, order: i })));
  await seedCollection("supporters", supporters.map((s, i) => supporterSchema.parse({ ...s, order: i })));

  // Test logins exist only in the local emulator.
  if (usingEmulator) {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (email && password) {
      for (const [addr, isAdmin] of [
        [email, true],
        [email.replace("@", "+viewer@"), false],
      ] as const) {
        let user = await auth.getUserByEmail(addr).catch(() => null);
        if (!user) user = await auth.createUser({ email: addr, password, emailVerified: true });
        await auth.setCustomUserClaims(user.uid, isAdmin ? { admin: true } : {});
        console.log(`✓ emulator login ${addr} (${isAdmin ? "admin" : "no admin rights"})`);
      }
    } else {
      console.log("· SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set, no test logins created");
    }
  }
  console.log("Done. Remember: this is sample content — edit it from /admin.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
