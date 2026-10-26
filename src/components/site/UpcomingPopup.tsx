"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Photo, Pin, Tape } from "@/components/craft";
import { CloseIcon } from "@/components/site/icons";
import { isUpcomingLive, type Upcoming } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const SEEN_KEY = "cc:upcoming-seen";
const DELAY_MS = 1200;

/* Browser storage can be missing or blocked (private mode), so never let it break the page. */
function seenIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}
function markSeen(id: string) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenIds(), id])]));
  } catch {
    /* ignore */
  }
}

/** Pops up once per visit with the next upcoming activity, while it's inside its date range. */
export function UpcomingPopup({ items }: { items: Upcoming[] }) {
  const [item, setItem] = useState<Upcoming | null>(null);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The page may be cached, so the dates are checked here, in the visitor's browser, at open time.
  useEffect(() => {
    const seen = seenIds();
    const next = items.find((u) => isUpcomingLive(u) && !seen.includes(u.id));
    if (!next) return;
    const t = setTimeout(() => {
      markSeen(next.id);
      setItem(next);
      setOpen(true);
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [items]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Keep keyboard focus inside the popup.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, close]);

  const hasImage = Boolean(item?.image.url);

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          key="upcoming"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upcoming-title"
          aria-describedby={item.description ? "upcoming-desc" : undefined}
          className="fixed inset-0 z-[80] flex overflow-y-auto bg-ink/55 p-4 backdrop-blur-[3px] sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && close()}
          data-lenis-prevent
        >
          <motion.article
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, rotate: -6, scale: 0.94 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, rotate: -1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, rotate: 2, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 210, damping: 22 }}
            className={cn(
              "relative m-auto w-full bg-card p-3 shadow-lift sm:p-4",
              hasImage ? "max-w-[min(56rem,100%)] sm:grid sm:grid-cols-[1.1fr_1fr]" : "max-w-lg",
            )}
          >
            <Tape color="tape-sage" className="-top-3.5 left-6 w-24 -rotate-6" />
            <Tape color="tape-blush" className="-top-3.5 right-14 w-20 rotate-3" />

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute -right-2.5 -top-2.5 z-10 grid size-11 place-items-center rounded-full bg-ink text-paper shadow-lg transition hover:rotate-90 hover:bg-sage-deep sm:-right-4 sm:-top-4"
            >
              <CloseIcon />
            </button>

            {hasImage ? (
              <div className="relative h-[34vh] min-h-48 overflow-hidden bg-paper-2 sm:h-auto sm:min-h-[26rem]">
                <Photo image={item.image} alt={item.image.alt || item.title} sizes="(max-width: 640px) 92vw, 30rem" className="!object-contain" />
              </div>
            ) : null}

            <div className="relative flex flex-col px-3 pb-3 pt-6 sm:px-7 sm:py-8">
              {hasImage ? null : <Pin className="-top-1 left-1/2 -translate-x-1/2" />}
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">✿ Coming up</p>
              <h2 id="upcoming-title" className="mt-3 font-display text-3xl leading-[1.05] text-ink text-balance sm:text-4xl">
                {item.title}
              </h2>
              {item.description ? (
                <p id="upcoming-desc" className="mt-4 whitespace-pre-line leading-relaxed text-charcoal">
                  {item.description}
                </p>
              ) : null}
              <p className="mt-5 font-hand text-2xl text-sage-deep -rotate-1">see you there!</p>
              <div className="mt-6 sm:mt-auto sm:pt-6">
                <button type="button" onClick={close} className="btn btn-primary w-full sm:w-auto">
                  Close
                </button>
              </div>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
