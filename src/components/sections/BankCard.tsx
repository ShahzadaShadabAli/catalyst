"use client";
import { useState } from "react";
import { Tape } from "@/components/craft";
import { CheckIcon, CopyIcon } from "@/components/site/icons";
import type { BankAccount } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s+/g, ""));
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked; the value is still selectable */
        }
      }}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border transition-all",
        copied ? "border-sage bg-sage text-card" : "border-line bg-card text-charcoal hover:border-ink hover:-rotate-6",
      )}
    >
      {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
    </button>
  );
}

const groupIban = (iban: string) => iban.replace(/(.{4})/g, "$1 ").trim();

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-line py-3 last:border-0">
      <div className="min-w-0">
        <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">{label}</dt>
        <dd className={cn("mt-0.5 break-words text-ink", copy ? "font-mono text-[0.95rem] tracking-wide" : "font-medium")}>
          {value}
        </dd>
      </div>
      {copy ? <CopyButton value={value} label={label} /> : null}
    </div>
  );
}

export function BankCard({ account, index }: { account: BankAccount; index: number }) {
  const wallet = account.kind === "wallet";
  return (
    <article className="paper-card h-full overflow-hidden">
      <Tape color={index % 2 ? "tape-blush" : "tape-sage"} className="-right-6 top-3 rotate-[38deg]" />
      <header className={cn("flex items-center justify-between gap-3 px-6 py-5", wallet ? "bg-blush/50" : "bg-sage-soft")}>
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sage-deep">
            {wallet ? "Mobile wallet" : "Bank transfer"}
          </p>
          <h3 className="mt-1 text-2xl leading-tight text-ink">{account.bankName}</h3>
        </div>
        <span aria-hidden className="h-8 w-11 rounded-md bg-gradient-to-br from-kraft to-[#c7ae7e] shadow-inner" />
      </header>
      <dl className="px-6 pb-4 pt-2">
        <Row label="Account title" value={account.accountTitle} />
        <Row label={wallet ? "Wallet number" : "Account number"} value={account.accountNumber} copy />
        <Row label="IBAN" value={account.iban ? groupIban(account.iban) : ""} copy />
        <Row label="Branch" value={account.branch} />
        <Row label="SWIFT / BIC" value={account.swift} copy />
      </dl>
      {account.note ? <p className="px-6 pb-6 font-hand text-xl leading-tight text-sage-deep">{account.note}</p> : null}
    </article>
  );
}
