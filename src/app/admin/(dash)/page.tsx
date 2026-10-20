import Link from "next/link";
import { StickyNote } from "@/components/craft";
import { adminCounts } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminHome() {
  await requireAdminPage();
  const c = await adminCounts();
  const uploads = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET);

  const cards = [
    { href: "/admin/applications", label: "New applications", value: c.newApps, note: `${c.totalApps} in total`, color: "sticky-butter" },
    { href: "/admin/works", label: "Works", value: c.events, note: "events & projects", color: "sticky-sage" },
    { href: "/admin/members", label: "Members", value: c.members, note: "on the wall", color: "sticky-blush" },
    { href: "/admin/leadership", label: "Leaders", value: c.leaders, note: "in the tree", color: "sticky-sky" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Hello there ✿</h1>
      <p className="mt-2 text-muted">Here&apos;s what&apos;s happening with the collective.</p>

      {!uploads ? (
        <p className="mt-6 rounded-xl bg-blush/40 px-4 py-3 text-sm text-ink">
          Image uploads are off until the Cloudinary keys are added. See <strong>SETUP.md</strong>. YouTube videos and text editing work now.
        </p>
      ) : null}

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <li key={card.href}>
            <Link href={card.href} className="block transition-transform hover:-translate-y-1" style={{ rotate: `${[-1.5, 1, -0.5, 1.5][i]}deg` }}>
              <StickyNote color={card.color}>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-charcoal">{card.label}</p>
                <p className="mt-2 font-display text-5xl text-ink">{card.value}</p>
                <p className="mt-1 font-hand text-xl text-charcoal">{card.note}</p>
              </StickyNote>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-2xl text-ink">Quick tips</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-charcoal">
          <li>Changes go live on the website as soon as you save.</li>
          <li>Unpublish an event to keep it as a draft while you add photos.</li>
          <li>Drag rows, or use the arrows, to change the order things appear in.</li>
          <li>Applications contain personal details. Don&apos;t share the CSV outside the team.</li>
        </ul>
      </div>
    </div>
  );
}
