"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteApplication, setApplicationStatus } from "@/actions/admin";
import type { Application, ApplicationStatus } from "@/lib/schemas";
import { cn, formatDate } from "@/lib/utils";
import { inputCls } from "./fields";
import { Drawer, PageHeader, useToast } from "./ui";

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  new: "bg-butter text-ink",
  accepted: "bg-sage-soft text-sage-deep",
  rejected: "bg-paper-2 text-muted",
};

function age(dob: string) {
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let a = now.getUTCFullYear() - d.getUTCFullYear();
  if (now.getUTCMonth() < d.getUTCMonth() || (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())) a--;
  return String(a);
}

export function ApplicationsManager({ items: initial }: { items: Application[] }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [type, setType] = useState<"all" | "permanent" | "honorary">("all");
  const [status, setStatus] = useState<"all" | ApplicationStatus>("new");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Pick up fresh server data after router.refresh().
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setItems(initial);
  }

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (a) =>
        (type === "all" || a.type === type) &&
        (status === "all" || a.status === status) &&
        (!needle || [a.fullName, a.email, a.city, a.phone, a.institution].some((v) => v.toLowerCase().includes(needle))),
    );
  }, [items, type, status, q]);

  const current = items.find((a) => a.id === openId) ?? null;

  function updateStatus(id: string, next: ApplicationStatus) {
    startTransition(async () => {
      const res = await setApplicationStatus(id, next);
      if (res.ok) {
        setItems((list) => list.map((a) => (a.id === id ? { ...a, status: next } : a)));
        toast(`Marked as ${next}`);
        router.refresh();
      } else toast(res.error, "error");
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this application permanently?")) return;
    startTransition(async () => {
      const res = await deleteApplication(id);
      if (res.ok) {
        setItems((list) => list.filter((a) => a.id !== id));
        setOpenId(null);
        toast("Application deleted");
        router.refresh();
      } else toast(res.error, "error");
    });
  }

  const count = (s: "all" | ApplicationStatus) => (s === "all" ? items.length : items.filter((a) => a.status === s).length);

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Everyone who filled in the Join Us form. Their details are private and only visible here."
        action={
          <a className="btn btn-ghost btn-sm" href={`/api/admin/applications/export?status=${status}`}>
            Download CSV
          </a>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-line bg-card p-1" role="group" aria-label="Status">
          {(["new", "accepted", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium capitalize", status === s ? "bg-ink text-paper" : "text-charcoal hover:bg-paper-2")}
            >
              {s} <span className="opacity-60">{count(s)}</span>
            </button>
          ))}
        </div>
        <select className={cn(inputCls, "w-auto py-2")} value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Membership type">
          <option value="all">All types</option>
          <option value="permanent">Permanent</option>
          <option value="honorary">Honorary</option>
        </select>
        <input className={cn(inputCls, "w-full py-2 sm:w-64")} placeholder="Search name, email, city…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search applications" />
      </div>

      {shown.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {shown.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => setOpenId(a.id)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-paper/70">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{a.fullName}</p>
                  <p className="truncate text-sm text-muted">
                    {a.city} · {a.education} · {age(a.dob)} yrs
                  </p>
                </div>
                <span className="hidden text-sm capitalize text-charcoal sm:block">{a.type}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_STYLE[a.status])}>{a.status}</span>
                <span className="hidden w-24 text-right text-sm text-muted md:block">{a.createdAt ? formatDate(a.createdAt) : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-card/60 p-10 text-center">
          <p className="font-hand text-3xl text-muted">No applications here.</p>
        </div>
      )}

      <Drawer
        open={current !== null}
        onClose={() => setOpenId(null)}
        title={current?.fullName ?? "Application"}
        footer={
          current ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" className="btn btn-sm text-danger hover:bg-danger/10" disabled={pending} onClick={() => remove(current.id)}>
                Delete
              </button>
              <div className="flex gap-2">
                {(["new", "accepted", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={pending || current.status === s}
                    onClick={() => updateStatus(current.id, s)}
                    className={cn("btn btn-sm capitalize", current.status === s ? "bg-ink text-paper" : "btn-ghost")}
                  >
                    {s === "new" ? "Mark new" : s === "accepted" ? "Accept" : "Reject"}
                  </button>
                ))}
              </div>
            </div>
          ) : null
        }
      >
        {current ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", STATUS_STYLE[current.status])}>{current.status}</span>
              <span className="rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold capitalize text-charcoal">{current.type} member</span>
              {current.createdAt ? <span className="rounded-full bg-paper-2 px-3 py-1 text-xs text-muted">Applied {formatDate(current.createdAt)}</span> : null}
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Date of birth", `${formatDate(current.dob)} (${age(current.dob)} yrs)`],
                ["Education", current.education],
                ["Institution", current.institution || "—"],
                ["City", current.city],
                ["Email", current.email],
                ["Phone", current.phone],
                ...(current.type === "honorary" ? [["Field / affiliation", current.expertise || "—"]] : []),
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-card p-3 ring-1 ring-line">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">{k}</dt>
                  <dd className="mt-1 break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-xl bg-butter/50 p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">Why they want to join</p>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-ink">{current.reason}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="btn btn-ghost btn-sm" href={`mailto:${current.email}`}>
                Email
              </a>
              <a
                className="btn btn-ghost btn-sm"
                href={`https://wa.me/${current.phone.replace(/\D/g, "").replace(/^0/, "92")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
