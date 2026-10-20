"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSite } from "@/actions/admin";
import type { Site } from "@/lib/schemas";
import { FieldRenderer, getPath, setPath, type FieldDef } from "./fields";
import { PageHeader, useToast } from "./ui";

const GROUPS: { title: string; description?: string; fields: FieldDef[] }[] = [
  {
    title: "Hero",
    description: "The first thing visitors see.",
    fields: [
      { type: "text", name: "hero.eyebrow", label: "Small line above the title", maxLength: 80, full: true },
      { type: "text", name: "hero.titleLine1", label: "Title, line 1", maxLength: 60 },
      { type: "text", name: "hero.titleLine2", label: "Title, line 2 (green italic)", maxLength: 60 },
      { type: "textarea", name: "hero.subtitle", label: "Intro sentence", rows: 3, maxLength: 300, full: true },
    ],
  },
  {
    title: "01 · Origin",
    fields: [
      { type: "text", name: "origin.title", label: "Heading", maxLength: 120, full: true },
      { type: "textarea", name: "origin.text", label: "Our story", hint: "Blank line between paragraphs", rows: 8, maxLength: 2500, full: true },
      { type: "images", name: "origin.images", label: "Photos", hint: "Up to 6", max: 6, full: true },
    ],
  },
  {
    title: "02 · Mission",
    fields: [
      { type: "textarea", name: "mission.title", label: "Mission statement", rows: 2, maxLength: 160, full: true },
      { type: "textarea", name: "mission.text", label: "More detail", rows: 4, maxLength: 1500, full: true },
      { type: "image", name: "mission.image", label: "Mission image", full: true },
      {
        type: "list",
        name: "mission.values",
        label: "Values (sticky notes)",
        itemLabel: "Value",
        blank: { title: "", text: "" },
        max: 6,
        full: true,
        itemFields: [
          { type: "text", name: "title", label: "Title", maxLength: 40 },
          { type: "text", name: "text", label: "One line", maxLength: 160 },
        ],
      },
    ],
  },
  {
    title: "08 · Join us",
    fields: [
      { type: "textarea", name: "join.permanentText", label: "What a permanent member is", rows: 3, maxLength: 600 },
      { type: "textarea", name: "join.honoraryText", label: "What an honorary member is", rows: 3, maxLength: 600 },
    ],
  },
  {
    title: "07 · Support",
    fields: [{ type: "textarea", name: "support.intro", label: "Intro text", rows: 3, maxLength: 600, full: true }],
  },
  {
    title: "Contact & socials",
    description: "Leave a box empty to hide that icon.",
    fields: [
      { type: "url", name: "socials.instagram", label: "Instagram", maxLength: 300, placeholder: "https://instagram.com/…" },
      { type: "url", name: "socials.facebook", label: "Facebook", maxLength: 300 },
      { type: "url", name: "socials.tiktok", label: "TikTok", maxLength: 300 },
      { type: "url", name: "socials.youtube", label: "YouTube", maxLength: 300 },
      { type: "url", name: "socials.linkedin", label: "LinkedIn", maxLength: 300 },
      { type: "tel", name: "whatsapp", label: "WhatsApp number", placeholder: "+92 3xx xxxxxxx" },
      { type: "email", name: "contactEmail", label: "Contact email", maxLength: 120 },
      { type: "text", name: "location", label: "Location", maxLength: 120 },
      { type: "text", name: "foundedYear", label: "Founded (year)", maxLength: 4 },
    ],
  },
];

export function SettingsForm({ site }: { site: Site }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<Site>(site);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await saveSite(draft);
      if (res.ok) {
        setErrors({});
        toast("Site updated");
        router.refresh();
      } else {
        setErrors(res.errors ?? {});
        toast(res.error, "error");
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <PageHeader
        title="Site settings"
        description="Text and photos for the home page, plus your contact details."
        action={
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        }
      />
      <div className="space-y-8">
        {GROUPS.map((g) => (
          <section key={g.title} className="rounded-2xl border border-line bg-card p-5 sm:p-7">
            <h2 className="font-display text-2xl text-ink">{g.title}</h2>
            {g.description ? <p className="mt-1 text-sm text-muted">{g.description}</p> : null}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {g.fields.map((f) => (
                <FieldRenderer
                  key={f.name}
                  def={f}
                  path={f.name}
                  value={getPath(draft, f.name)}
                  onChange={(v) => setDraft((d) => setPath(d, f.name, v))}
                  errors={errors}
                  ctx={{ selfId: null }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button type="submit" className="btn btn-primary shadow-xl" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
