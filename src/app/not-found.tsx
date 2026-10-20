import Link from "next/link";
import { StickyNote, Tape } from "@/components/craft";

export default function NotFound() {
  return (
    <main className="grid-paper grid min-h-dvh place-items-center px-5">
      <StickyNote color="sticky-blush" className="max-w-sm rotate-[-3deg] px-8 py-10 text-center">
        <Tape color="tape-sage" className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal">Error 404</p>
        <h1 className="mt-3 font-hand text-5xl leading-none text-ink">This page wandered off.</h1>
        <p className="mt-4 text-charcoal">Maybe it went to a clean-up drive.</p>
        <Link href="/" className="btn btn-primary btn-sm mt-7">
          Back home
        </Link>
      </StickyNote>
    </main>
  );
}
