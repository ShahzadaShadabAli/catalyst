export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Deterministic "hand-placed" tilt so server and client render the same angle. */
const TILTS = [-2.4, 1.8, -1.2, 2.6, -3, 1.1, -0.8, 2.2];
export const tilt = (i: number, scale = 1) => TILTS[i % TILTS.length]! * scale;

const NOTE_COLORS = ["sticky-butter", "sticky-sage", "sticky-blush", "sticky-sky"] as const;
export const noteColor = (i: number) => NOTE_COLORS[i % NOTE_COLORS.length]!;

const TAPE_COLORS = ["", "tape-sage", "tape-blush", "tape-butter", "tape-sky"] as const;
export const tapeColor = (i: number) => TAPE_COLORS[i % TAPE_COLORS.length]!;

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(d);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
