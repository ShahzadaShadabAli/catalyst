"use client";
import type { BankAccount, Event, Leader, Member, Note, Supporter, Upcoming } from "@/lib/schemas";
import { emptyImage } from "@/lib/schemas";
import { formatDate } from "@/lib/utils";
import { CollectionManager } from "./CollectionManager";
import type { FieldDef } from "./fields";

type Row = { id: string } & Record<string, unknown>;
const rows = <T extends { id: string }>(items: T[]) => items as unknown as Row[];

const Badge = ({ children, tone = "sage" }: { children: React.ReactNode; tone?: "sage" | "blush" | "muted" }) => (
  <span
    className={
      tone === "sage"
        ? "rounded-full bg-sage-soft px-2.5 py-0.5 text-xs font-semibold text-sage-deep"
        : tone === "blush"
          ? "rounded-full bg-blush/60 px-2.5 py-0.5 text-xs font-semibold text-ink"
          : "rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-semibold text-muted"
    }
  >
    {children}
  </span>
);

/* ───────── Leadership ───────── */

const leaderFields: FieldDef[] = [
  { type: "text", name: "name", label: "Name", maxLength: 80 },
  { type: "text", name: "role", label: "Role", maxLength: 80, placeholder: "e.g. Events Lead" },
  { type: "parent", name: "parentId", label: "Reports to", hint: "Shapes the tree", full: true },
  { type: "textarea", name: "bio", label: "Short bio", hint: "Optional", rows: 2, maxLength: 280, full: true },
  { type: "image", name: "photo", label: "Photo", full: true },
];

export function LeadersManager({ items }: { items: Leader[] }) {
  return (
    <CollectionManager
      collection="leaders"
      title="Leadership"
      description="The tree on the home page. Pick who each person reports to; people at the top have no one above them."
      singular="Leader"
      items={rows(items)}
      fields={leaderFields}
      blank={{ name: "", role: "", bio: "", parentId: null, photo: emptyImage, order: 0 }}
      summary={(item, all) => {
        const parent = all.find((p) => p.id === item.parentId);
        return {
          title: String(item.name),
          subtitle: `${item.role}${parent ? ` · reports to ${parent.name}` : " · top of the tree"}`,
          image: item.photo as Leader["photo"],
        };
      }}
    />
  );
}

/* ───────── Members ───────── */

const GENDER_LABEL: Record<string, string> = { female: "Female", male: "Male" };

const memberFields: FieldDef[] = [
  { type: "text", name: "name", label: "Name", maxLength: 80 },
  { type: "text", name: "role", label: "Role / focus", hint: "Optional", maxLength: 80 },
  {
    type: "select",
    name: "type",
    label: "Membership",
    options: [
      { value: "permanent", label: "Permanent" },
      { value: "honorary", label: "Honorary" },
    ],
  },
  {
    type: "select",
    name: "gender",
    label: "Gender",
    options: [
      { value: "", label: "Prefer not to say" },
      { value: "female", label: "Female" },
      { value: "male", label: "Male" },
    ],
  },
  { type: "number", name: "joinedYear", label: "Joined in", hint: "Optional", min: 2000, max: 2100, nullable: true },
  {
    type: "textarea",
    name: "quote",
    label: "Why they joined",
    hint: "In their own words, shown in quotes",
    rows: 2,
    maxLength: 160,
    full: true,
  },
  { type: "checkbox", name: "visible", label: "Show on website", full: true },
  { type: "image", name: "photo", label: "Photo", full: true },
];

export function MembersManager({ items }: { items: Member[] }) {
  return (
    <CollectionManager
      collection="members"
      title="Members"
      description="Everyone on the members wall. Untick “Show on website” to hide someone without deleting them."
      singular="Member"
      items={rows(items)}
      fields={memberFields}
      blank={{
        name: "",
        role: "",
        type: "permanent",
        gender: "",
        quote: "",
        joinedYear: new Date().getFullYear(),
        visible: true,
        photo: emptyImage,
        order: 0,
      }}
      summary={(item) => ({
        title: String(item.name),
        subtitle: [item.role, GENDER_LABEL[String(item.gender)], item.joinedYear && `since ${item.joinedYear}`]
          .filter(Boolean)
          .join(" · "),
        image: item.photo as Member["photo"],
        badge: (
          <span className="hidden gap-1 sm:flex">
            {item.type === "honorary" ? <Badge tone="blush">Honorary</Badge> : null}
            {item.visible ? null : <Badge tone="muted">Hidden</Badge>}
          </span>
        ),
      })}
    />
  );
}

/* ───────── Works / events ───────── */

const eventFields: FieldDef[] = [
  { type: "text", name: "title", label: "Event name", maxLength: 120, full: true },
  { type: "slug", name: "slug", label: "Page link", from: "title", hint: "Lowercase and dashes", full: true },
  { type: "date", name: "date", label: "Date" },
  { type: "text", name: "location", label: "Location", maxLength: 120 },
  { type: "textarea", name: "summary", label: "Short summary", hint: "Shown on the card", rows: 2, maxLength: 300, full: true },
  {
    type: "textarea",
    name: "story",
    label: "What happened",
    hint: "Leave a blank line between paragraphs",
    rows: 9,
    maxLength: 8000,
    full: true,
  },
  { type: "image", name: "cover", label: "Cover photo", full: true },
  {
    type: "list",
    name: "testimonials",
    label: "What locals said",
    itemLabel: "Quote",
    blank: { quote: "", name: "", role: "" },
    max: 40,
    full: true,
    itemFields: [
      { type: "textarea", name: "quote", label: "Quote", rows: 2, maxLength: 500, full: true },
      { type: "text", name: "name", label: "Who said it", maxLength: 80 },
      { type: "text", name: "role", label: "Role / place", hint: "Optional", maxLength: 80 },
    ],
  },
  { type: "media", name: "media", label: "Gallery: photos & YouTube videos", full: true },
  { type: "checkbox", name: "published", label: "Published", hint: "Untick to keep it as a draft", full: true },
];

export function EventsManager({ items }: { items: Event[] }) {
  return (
    <CollectionManager
      collection="events"
      title="Works"
      description="Every event or project. The newest date shows first on the website."
      singular="Event"
      wide
      reorderable={false}
      items={rows(items)}
      fields={eventFields}
      blank={{
        title: "",
        slug: "",
        date: new Date().toISOString().slice(0, 10),
        location: "",
        summary: "",
        story: "",
        cover: emptyImage,
        testimonials: [],
        media: [],
        published: true,
        order: 0,
      }}
      summary={(item) => ({
        title: String(item.title),
        subtitle: `${formatDate(String(item.date))}${item.location ? ` · ${item.location}` : ""}`,
        image: item.cover as Event["cover"],
        badge: item.published ? null : <Badge tone="muted">Draft</Badge>,
      })}
      previewHref={(item) => (item.published ? `/works/${item.slug}` : null)}
    />
  );
}

/* ───────── Leadership notes ───────── */

const noteFields: FieldDef[] = [
  { type: "textarea", name: "quote", label: "Quote", rows: 3, maxLength: 300, full: true },
  { type: "textarea", name: "body", label: "Text under the quote", hint: "Optional", rows: 3, maxLength: 900, full: true },
  { type: "text", name: "authorName", label: "Name", maxLength: 80 },
  { type: "text", name: "authorRole", label: "Role", maxLength: 80 },
  { type: "image", name: "photo", label: "Photo", full: true },
];

export function NotesManager({ items }: { items: Note[] }) {
  return (
    <CollectionManager
      collection="notes"
      title="Leadership notes"
      description="The pinned quote cards in the “A note” carousel."
      singular="Note"
      items={rows(items)}
      fields={noteFields}
      blank={{ quote: "", body: "", authorName: "", authorRole: "", photo: emptyImage, order: 0 }}
      summary={(item) => ({ title: `“${item.quote}”`, subtitle: `${item.authorName}, ${item.authorRole}`, image: item.photo as Note["photo"] })}
    />
  );
}

/* ───────── Bank accounts ───────── */

const bankFields: FieldDef[] = [
  {
    type: "select",
    name: "kind",
    label: "Type",
    options: [
      { value: "bank", label: "Bank account" },
      { value: "wallet", label: "Mobile wallet (JazzCash, Easypaisa…)" },
    ],
  },
  { type: "text", name: "bankName", label: "Bank / wallet name", maxLength: 80, placeholder: "e.g. Meezan Bank" },
  { type: "text", name: "accountTitle", label: "Account title", maxLength: 120, full: true },
  { type: "text", name: "accountNumber", label: "Account / wallet number", maxLength: 40 },
  { type: "text", name: "iban", label: "IBAN", hint: "Banks only", maxLength: 34, placeholder: "PK36SCBL0000001123456702" },
  { type: "text", name: "branch", label: "Branch name / code", hint: "Optional", maxLength: 120 },
  { type: "text", name: "swift", label: "SWIFT / BIC", hint: "For donations from abroad", maxLength: 11 },
  { type: "textarea", name: "note", label: "Note for donors", hint: "Optional", rows: 2, maxLength: 300, full: true },
];

export function BanksManager({ items }: { items: BankAccount[] }) {
  return (
    <CollectionManager
      collection="bankAccounts"
      title="Support: bank details"
      description="Shown as cards in the Support section. The website never processes payments; it only displays these details."
      singular="Account"
      items={rows(items)}
      fields={bankFields}
      blank={{ kind: "bank", bankName: "", accountTitle: "", accountNumber: "", iban: "", branch: "", swift: "", note: "", order: 0 }}
      summary={(item) => ({
        title: String(item.bankName),
        subtitle: `${item.accountTitle} · ${item.accountNumber}`,
        badge: <Badge tone={item.kind === "wallet" ? "blush" : "sage"}>{item.kind === "wallet" ? "Wallet" : "Bank"}</Badge>,
      })}
    />
  );
}

/* ───────── Supporters ───────── */

const supporterFields: FieldDef[] = [
  { type: "text", name: "name", label: "Organisation", maxLength: 100 },
  { type: "url", name: "url", label: "Website", hint: "Optional, https://", maxLength: 300 },
  { type: "textarea", name: "blurb", label: "One line about them", hint: "Optional", rows: 2, maxLength: 220, full: true },
  { type: "image", name: "logo", label: "Logo", full: true },
];

export function SupportersManager({ items }: { items: Supporter[] }) {
  return (
    <CollectionManager
      collection="supporters"
      title="Supported by"
      description="Organisations that back our work."
      singular="Supporter"
      items={rows(items)}
      fields={supporterFields}
      blank={{ name: "", url: "", blurb: "", logo: emptyImage, order: 0 }}
      summary={(item) => ({ title: String(item.name), subtitle: String(item.blurb ?? ""), image: item.logo as Supporter["logo"] })}
    />
  );
}

/* ───────── Upcoming activity popup ───────── */

const upcomingFields: FieldDef[] = [
  { type: "text", name: "title", label: "Title", maxLength: 120, full: true, placeholder: "e.g. Catalyst × Yarnive Workshop" },
  {
    type: "textarea",
    name: "description",
    label: "Description",
    hint: "When, where, what to bring…",
    rows: 5,
    maxLength: 700,
    full: true,
  },
  { type: "date", name: "showFrom", label: "Show from", hint: "Leave empty to start now" },
  { type: "date", name: "showUntil", label: "Show until", hint: "Last day it pops up" },
  { type: "checkbox", name: "active", label: "Switched on", hint: "Untick to hide it early", full: true },
  { type: "image", name: "image", label: "Picture / poster", full: true },
];

/** `today` is the date in Pakistan, worked out on the server, so the status labels stay pure. */
function upcomingStatus(item: Record<string, unknown>, today: string) {
  const from = String(item.showFrom ?? "");
  const until = String(item.showUntil ?? "");
  if (!item.active) return { label: "Off", tone: "muted" as const, text: "switched off" };
  if (until < today) return { label: "Ended", tone: "muted" as const, text: `ended ${formatDate(until)}` };
  if (from && from > today) return { label: "Scheduled", tone: "blush" as const, text: `${formatDate(from)} → ${formatDate(until)}` };
  return { label: "Showing now", tone: "sage" as const, text: `until ${formatDate(until)}` };
}

export function UpcomingManager({ items, today }: { items: Upcoming[]; today: string }) {
  const week = new Date(Date.parse(`${today}T00:00:00Z`) + 7 * 86400000).toISOString().slice(0, 10);
  return (
    <CollectionManager
      collection="upcoming"
      title="Upcoming activity"
      description="Pops up when someone opens the website, once per visit, until the end of the “Show until” day (Pakistan time). If several are showing at once, the top one wins."
      singular="Activity"
      items={rows(items)}
      fields={upcomingFields}
      blank={{ title: "", description: "", image: emptyImage, showFrom: "", showUntil: week, active: true, order: 0 }}
      summary={(item) => {
        const status = upcomingStatus(item, today);
        return {
          title: String(item.title),
          subtitle: status.text,
          image: item.image as Upcoming["image"],
          badge: <Badge tone={status.tone}>{status.label}</Badge>,
        };
      }}
    />
  );
}
