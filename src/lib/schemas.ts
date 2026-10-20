import { z } from "zod";

/* Shared by the browser forms and the server. The server always re-validates. */

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);
const required = (max: number, label = "This") =>
  z.string().trim().min(1, `${label} is required`).max(max, `Keep it under ${max} characters`);

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** Images are either a local file in /public or an upload in our Cloudinary account. */
export function isAllowedImageUrl(url: string): boolean {
  if (url === "") return true;
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("..")) return true;
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname === "res.cloudinary.com" &&
      (cloudName === "" || u.pathname.startsWith(`/${cloudName}/`))
    );
  } catch {
    return false;
  }
}

export const imageSchema = z.object({
  url: z.string().trim().max(600).refine(isAllowedImageUrl, "Image must be uploaded to our Cloudinary"),
  alt: text(200).default(""),
  publicId: text(300).optional(),
});
export type ImageRef = z.infer<typeof imageSchema>;
export const emptyImage: ImageRef = { url: "", alt: "" };

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Use a full https:// link")
  .default("");

const order = z.number().int().min(0).max(100000).default(0);

/* ───────── Content collections ───────── */

export const leaderSchema = z.object({
  name: required(80, "Name"),
  role: required(80, "Role"),
  bio: text(280).default(""),
  photo: imageSchema.default(emptyImage),
  parentId: z.string().trim().max(64).nullable().default(null),
  order,
});

export const memberSchema = z.object({
  name: required(80, "Name"),
  role: text(80).default(""),
  type: z.enum(["permanent", "honorary"]).default("permanent"),
  /** "" means not stated. */
  gender: z.enum(["", "female", "male"]).default(""),
  /** Why they joined, in their own words. Shown in quotes under their photo. */
  quote: text(160).default(""),
  joinedYear: z.number().int().min(2000).max(2100).nullable().default(null),
  photo: imageSchema.default(emptyImage),
  visible: z.boolean().default(true),
  order,
});

const youtubeId = z.string().regex(/^[A-Za-z0-9_-]{11}$/, "Not a valid YouTube video");

export const mediaSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("image"), image: imageSchema, caption: text(200).default("") }),
  z.object({ kind: z.literal("youtube"), youtubeId, caption: text(200).default("") }),
]);
export type MediaItem = z.infer<typeof mediaSchema>;

export const testimonialSchema = z.object({
  quote: required(500, "Quote"),
  name: required(80, "Name"),
  role: text(80).default(""),
});

export const eventSchema = z.object({
  title: required(120, "Title"),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  location: text(120).default(""),
  summary: text(300).default(""),
  story: text(8000).default(""),
  cover: imageSchema.default(emptyImage),
  testimonials: z.array(testimonialSchema).max(40).default([]),
  media: z.array(mediaSchema).max(120).default([]),
  published: z.boolean().default(true),
  order,
});

export const noteSchema = z.object({
  quote: required(300, "Quote"),
  body: text(900).default(""),
  authorName: required(80, "Name"),
  authorRole: text(80).default(""),
  photo: imageSchema.default(emptyImage),
  order,
});

const accountNumber = z
  .string()
  .trim()
  .min(4, "Account number is required")
  .max(40)
  .regex(/^[0-9 -]+$/, "Digits, spaces and dashes only");

export const bankSchema = z.object({
  kind: z.enum(["bank", "wallet"]).default("bank"),
  bankName: required(80, "Bank name"),
  accountTitle: required(120, "Account title"),
  accountNumber,
  iban: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => v === "" || /^PK\d{2}[A-Z]{4}[0-9A-Z]{16}$/.test(v), "Pakistani IBANs look like PK36SCBL0000001123456702")
    .default(""),
  branch: text(120).default(""),
  swift: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v), "SWIFT codes are 8 or 11 characters")
    .default(""),
  note: text(300).default(""),
  order,
});

export const supporterSchema = z.object({
  name: required(100, "Name"),
  logo: imageSchema.default(emptyImage),
  url: optionalUrl,
  blurb: text(220).default(""),
  order,
});

export const siteSchema = z.object({
  hero: z
    .object({
      eyebrow: text(80).default("Est. Skardu · Gilgit-Baltistan"),
      titleLine1: text(60).default("Empowering people."),
      titleLine2: text(60).default("Transforming communities."),
      subtitle: text(300).default(""),
    })
    .prefault({}),
  origin: z
    .object({ title: text(120).default(""), text: text(2500).default(""), images: z.array(imageSchema).max(6).default([]) })
    .prefault({}),
  mission: z
    .object({
      title: text(160).default(""),
      text: text(1500).default(""),
      image: imageSchema.default(emptyImage),
      values: z.array(z.object({ title: required(40, "Value"), text: text(160).default("") })).max(6).default([]),
    })
    .prefault({}),
  join: z
    .object({ permanentText: text(600).default(""), honoraryText: text(600).default("") })
    .prefault({}),
  support: z.object({ intro: text(600).default("") }).prefault({}),
  socials: z
    .object({
      instagram: optionalUrl,
      facebook: optionalUrl,
      tiktok: optionalUrl,
      youtube: optionalUrl,
      linkedin: optionalUrl,
    })
    .prefault({}),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9 ]{10,16}$/.test(v), "Use a phone number like +92 3xx xxxxxxx")
    .default(""),
  contactEmail: z.union([z.literal(""), z.email("Enter a valid email")]).default(""),
  location: text(120).default("Skardu, Gilgit-Baltistan"),
  foundedYear: text(4).default(""),
});

export type Leader = z.infer<typeof leaderSchema> & { id: string };
export type Member = z.infer<typeof memberSchema> & { id: string };
export type Event = z.infer<typeof eventSchema> & { id: string };
export type Note = z.infer<typeof noteSchema> & { id: string };
export type BankAccount = z.infer<typeof bankSchema> & { id: string };
export type Supporter = z.infer<typeof supporterSchema> & { id: string };
export type Site = z.infer<typeof siteSchema>;

/** Collections an admin can edit through the generic editor. */
export const collectionSchemas = {
  leaders: leaderSchema,
  members: memberSchema,
  events: eventSchema,
  notes: noteSchema,
  bankAccounts: bankSchema,
  supporters: supporterSchema,
} as const;
export type CollectionName = keyof typeof collectionSchemas;
export const collectionNames = Object.keys(collectionSchemas) as CollectionName[];

/* ───────── Join Us applications ───────── */

export const educationLevels = [
  "Matric / O-Level",
  "Intermediate / A-Level",
  "Undergraduate",
  "Graduate",
  "Postgraduate",
  "Other",
] as const;

function ageOn(dob: string, now = new Date()): number {
  const d = new Date(`${dob}T00:00:00Z`);
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

export const applicationSchema = z
  .object({
    type: z.enum(["permanent", "honorary"], { error: "Choose a membership type" }),
    fullName: z
      .string()
      .trim()
      .min(2, "Tell us your full name")
      .max(80, "Keep it under 80 characters")
      .regex(/^[\p{L}\p{M}' .-]+$/u, "Letters, spaces, dots and dashes only"),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick your date of birth")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Pick your date of birth")
      .refine((v) => {
        const a = ageOn(v);
        return a >= 10 && a <= 100;
      }, "Please check your date of birth"),
    education: z.enum(educationLevels, { error: "Choose your education level" }),
    institution: text(120).default(""),
    city: z.string().trim().min(2, "Which city are you in?").max(60),
    email: z.email("Enter a valid email").max(120),
    phone: z
      .string()
      .trim()
      .refine((v) => /^\+?[0-9 ()-]{10,20}$/.test(v) && v.replace(/\D/g, "").length >= 10, "Enter a phone number like 03xx xxxxxxx"),
    reason: z
      .string()
      .trim()
      .min(20, "Tell us a little more (at least 20 characters)")
      .max(1000, "Keep it under 1000 characters"),
    expertise: text(200).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.type === "honorary" && v.expertise.length < 2) {
      ctx.addIssue({ code: "custom", path: ["expertise"], message: "Tell us your field or affiliation" });
    }
  });
export type ApplicationInput = z.infer<typeof applicationSchema>;

export const applicationStatuses = ["new", "accepted", "rejected"] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];
export type Application = ApplicationInput & { id: string; status: ApplicationStatus; createdAt: string };

/** Turn a ZodError into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
