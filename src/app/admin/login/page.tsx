import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pin, Tape } from "@/components/craft";
import { getAdminSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Team login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <main className="grid-paper grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="paper-card -rotate-1 px-7 pb-9 pt-12">
          <Tape color="tape-sage" className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
          <Pin className="right-5 top-5" color="pin-blush" />
          <div className="mb-8 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-paper ring-1 ring-line">
              <Image src="/brand/mark.png" alt="" width={30} height={27} className="h-auto w-[30px]" />
            </span>
            <div>
              <h1 className="font-display text-2xl leading-none text-ink">Team login</h1>
              <p className="mt-1 text-sm text-muted">Catalyst Collective admin</p>
            </div>
          </div>
          <LoginForm />
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/" className="underline-offset-4 hover:underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
