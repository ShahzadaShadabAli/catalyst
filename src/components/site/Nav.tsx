"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#origin", label: "Origin" },
  { href: "/#mission", label: "Mission" },
  { href: "/#team", label: "Team" },
  { href: "/#works", label: "Works" },
  { href: "/#support", label: "Support" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 400 && y > prev && !open);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      >
        <nav
          aria-label="Main"
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-300 sm:px-4",
            scrolled ? "bg-card/85 shadow-[0_10px_30px_-18px_rgba(43,43,43,.45)] backdrop-blur-md" : "bg-transparent",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Catalyst Collective, home">
            <span className="relative grid size-10 place-items-center rounded-full bg-card shadow-sm ring-1 ring-line transition-transform duration-500 group-hover:rotate-[-12deg]">
              <Image src="/brand/mark.png" alt="" width={26} height={24} className="h-auto w-[26px]" priority />
            </span>
            <span className="hidden font-display text-lg leading-none tracking-tight text-ink sm:block">
              Catalyst <span className="italic text-sage-deep">Collective</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-sage-soft hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link href="/#join" className="btn btn-primary btn-sm">
              Join us
            </Link>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full bg-card ring-1 ring-line md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-4">
                <span className={cn("absolute left-0 top-0 h-0.5 w-4 bg-ink transition", open && "top-1.5 rotate-45")} />
                <span className={cn("absolute bottom-0 left-0 h-0.5 w-4 bg-ink transition", open && "bottom-1 -rotate-45")} />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="grid-paper fixed inset-0 z-40 flex flex-col justify-center px-8 md:hidden"
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul className="space-y-2">
              {[...LINKS, { href: "/#join", label: "Join us" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-5xl leading-tight text-ink"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <p className="mt-10 font-hand text-2xl text-sage-deep">made with care in Skardu ✿</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
