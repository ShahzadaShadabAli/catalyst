"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/upcoming", label: "Upcoming popup" },
  { href: "/admin/works", label: "Works" },
  { href: "/admin/leadership", label: "Leadership" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/notes", label: "Leadership notes" },
  { href: "/admin/support", label: "Bank details" },
  { href: "/admin/supporters", label: "Supported by" },
  { href: "/admin/settings", label: "Site settings" },
];

export function AdminNav({ username, newApps }: { username: string; newApps: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => null);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-paper/10 bg-ink text-paper lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0">
      <div className="flex items-center justify-between px-5 py-4 lg:py-6">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-paper">
            <Image src="/brand/mark.png" alt="" width={24} height={22} className="h-auto w-6" />
          </span>
          <span className="font-display text-lg leading-tight">
            Catalyst <span className="italic text-sage-soft">admin</span>
          </span>
        </Link>
        <button
          type="button"
          className="rounded-full border border-paper/20 px-3 py-1.5 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="admin-nav"
          onClick={() => setOpen((o) => !o)}
        >
          Menu
        </button>
      </div>
      <nav id="admin-nav" aria-label="Admin" className={cn("px-3 pb-4 lg:block", open ? "block" : "hidden")}>
        <ul className="space-y-0.5">
          {LINKS.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-[0.95rem] transition",
                    active ? "bg-paper text-ink" : "text-paper/75 hover:bg-paper/10 hover:text-paper",
                  )}
                >
                  {l.label}
                  {l.href === "/admin/applications" && newApps > 0 ? (
                    <span className="rounded-full bg-butter px-2 py-0.5 text-xs font-bold text-ink">{newApps}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 border-t border-paper/10 px-3 pt-4 text-sm">
          <a href="/" target="_blank" rel="noopener" className="block py-1 text-paper/75 hover:text-paper">
            View website ↗
          </a>
          <p className="mt-3 truncate text-paper/50" title={username}>
            Signed in as {username}
          </p>
          <button type="button" onClick={logout} disabled={busy} className="mt-2 text-paper/75 underline-offset-4 hover:text-paper hover:underline">
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </nav>
    </aside>
  );
}
