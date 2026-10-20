"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Photo, Tape } from "@/components/craft";
import type { Member } from "@/lib/schemas";
import { cn, tapeColor, tilt } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "Everyone" },
  { key: "permanent", label: "Permanent" },
  { key: "honorary", label: "Honorary" },
] as const;

export function MembersWall({ members }: { members: Member[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const reduce = useReducedMotion();
  const shown = filter === "all" ? members : members.filter((m) => m.type === filter);

  if (!members.length) {
    return <p className="text-center font-hand text-2xl text-muted">Member photos coming soon.</p>;
  }

  return (
    <div>
      <div role="group" aria-label="Filter members" className="mb-12 flex flex-wrap justify-center gap-2">
        {FILTERS.map((f) => {
          const count = f.key === "all" ? members.length : members.filter((m) => m.type === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                filter === f.key
                  ? "-rotate-2 border-ink bg-ink text-paper"
                  : "border-line bg-card text-charcoal hover:border-ink",
              )}
            >
              {f.label} <span className="ml-1 font-mono text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <motion.ul layout={!reduce} className="grid grid-cols-2 items-start gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {shown.map((m, i) => (
            <motion.li
              key={m.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.8, rotate: tilt(i) - 8 }}
              animate={{ opacity: 1, scale: 1, rotate: tilt(i) }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={reduce ? undefined : { rotate: 0, y: -6, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
            >
              <figure className="polaroid polaroid-sm">
                {i % 3 === 0 ? <Tape color={tapeColor(i)} className="-top-3 left-1/2 w-16 -translate-x-1/2 rotate-3" /> : null}
                <div className="relative aspect-square overflow-hidden bg-paper-2">
                  <Photo image={m.photo} sizes="(max-width: 640px) 45vw, 180px" fallbackLabel={m.name} />
                  {m.type === "honorary" ? (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-sage-deep">
                      Honorary
                    </span>
                  ) : null}
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 flex h-8 items-center justify-center px-1 text-center font-hand text-lg leading-none text-charcoal">
                  {m.name}
                </figcaption>
              </figure>
              {m.role ? (
                <p className="mt-2 text-center font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">{m.role}</p>
              ) : null}
              {m.quote ? (
                <blockquote className="mt-2 px-1 text-center font-hand text-[1.15rem] leading-[1.15] text-sage-deep">
                  <span aria-hidden className="mr-0.5 font-display text-xl leading-none text-sage/70">
                    &ldquo;
                  </span>
                  {m.quote}
                  <span aria-hidden className="ml-0.5 font-display text-xl leading-none text-sage/70">
                    &rdquo;
                  </span>
                </blockquote>
              ) : null}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
