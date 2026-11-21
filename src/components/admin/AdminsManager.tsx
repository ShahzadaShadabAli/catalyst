"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createAdmin, deleteAdmin } from "@/actions/admins";
import type { AdminUser } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { ErrorText, inputCls, Label } from "./fields";
import { PageHeader, useToast } from "./ui";

const blank = { username: "", password: "", confirm: "" };

function when(iso: string) {
  if (!iso) return "never";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(iso));
}

export function AdminsManager({ admins, me }: { admins: AdminUser[]; me: string }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (key: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((errs) => Object.fromEntries(Object.entries(errs).filter(([k]) => k !== key)));
  };

  function add(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createAdmin(form);
      if (res.ok) {
        toast(`Admin “${res.id}” added`);
        setForm(blank);
        setErrors({});
        router.refresh();
      } else {
        setErrors(res.errors ?? {});
        toast(res.error, "error");
      }
    });
  }

  function remove(username: string) {
    if (!window.confirm(`Remove admin “${username}”? They'll be signed out straight away and can't sign in again.`)) return;
    startTransition(async () => {
      const res = await deleteAdmin(username);
      if (res.ok) {
        toast(`Admin “${username}” removed`);
        router.refresh();
      } else toast(res.error, "error");
    });
  }

  const field = (key: keyof typeof blank, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <Label htmlFor={`new-${key}`} hint={props.title}>
        {label}
      </Label>
      <input
        id={`new-${key}`}
        className={inputCls}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `new-${key}-err` : undefined}
        {...props}
        title={undefined}
      />
      <ErrorText id={`new-${key}-err`}>{errors[key]}</ErrorText>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Owners can add admins and remove the ones they added. Admins you add can edit everything on the website, but they can't add or remove other admins."
      />

      <ul className="space-y-3">
        {admins.map((a) => {
          const mine = a.role === "admin" && a.createdBy === me;
          return (
            <li key={a.username} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-card px-4 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-soft font-display text-lg text-sage-deep">
                {a.username[0]!.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {a.username}
                  {a.username === me ? <span className="font-normal text-muted"> (you)</span> : null}
                </p>
                <p className="text-sm text-muted">
                  {a.role === "admin" && a.createdBy ? `Added by ${a.createdBy} · ` : ""}
                  Last signed in {when(a.lastLoginAt)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  a.role === "owner" ? "bg-ink text-paper" : "bg-sage-soft text-sage-deep",
                )}
              >
                {a.role === "owner" ? "Owner" : "Admin"}
              </span>
              {mine ? (
                <button
                  type="button"
                  className="btn btn-sm text-danger hover:bg-danger/10"
                  disabled={pending}
                  onClick={() => remove(a.username)}
                >
                  Remove
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="mt-10 rounded-2xl border border-line bg-card p-6" noValidate>
        <h2 className="font-display text-2xl text-ink">Add an admin</h2>
        <p className="mt-1 text-sm text-muted">Share the username and password with them privately, not over a group chat.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {field("username", "Username", {
            autoComplete: "off",
            autoCapitalize: "none",
            spellCheck: false,
            maxLength: 32,
            placeholder: "e.g. maryam",
          })}
          {field("password", "Password", {
            type: show ? "text" : "password",
            autoComplete: "new-password",
            maxLength: 200,
            title: "12+ characters",
          })}
          {field("confirm", "Type it again", { type: show ? "text" : "password", autoComplete: "new-password", maxLength: 200 })}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 accent-sage-deep" />
            Show passwords
          </label>
          <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
            {pending ? "Saving…" : "Add admin"}
          </button>
        </div>
      </form>
    </div>
  );
}
