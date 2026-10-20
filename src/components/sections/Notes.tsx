"use client";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useState } from "react";
import { Photo, Pin } from "@/components/craft";
import { ChevronIcon } from "@/components/site/icons";
import type { Note } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/** Pinned quote cards from the leadership, one at a time, swipeable on phones. */
export function NotesCarousel({ notes, place, founded }: { notes: Note[]; place: string; founded: string }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const reduce = useReducedMotion();
  if (!notes.length) return null;

  const go = (delta: number) => setState(([i]) => [(i + delta + notes.length) % notes.length, delta]);
  const note = notes[index]!;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Notes from the leadership"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="relative mx-auto max-w-4xl">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.article
            key={note.id}
            custom={dir}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${notes.length}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 80, rotate: dir * 4 }}
            animate={{ opacity: 1, x: 0, rotate: -1.2 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -80, rotate: dir * -4 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            drag={notes.length > 1 && !reduce ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={onDragEnd}
            className="paper-card cursor-grab px-6 pb-10 pt-12 active:cursor-grabbing md:px-14 md:pb-14 md:pt-14"
          >
            <Pin className="left-5 top-5" />
            <Pin className="right-5 top-5" />
            <div className="mb-8 flex justify-between gap-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted md:mb-10">
              <span>
                No. {String(index + 1).padStart(3, "0")} · {place}
              </span>
              <span>CC{founded ? ` · Est. ${founded}` : ""}</span>
            </div>
            <div className="grid items-start gap-8 md:grid-cols-[200px_1fr] md:gap-12">
              <div className="flex items-center gap-4 md:flex-col md:text-center">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-paper md:size-36">
                  <Photo image={note.photo} sizes="144px" fallbackLabel={note.authorName} />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold leading-tight text-ink">{note.authorName}</p>
                  {note.authorRole ? (
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">{note.authorRole}</p>
                  ) : null}
                </div>
              </div>
              <div>
                <blockquote className="font-display text-2xl leading-snug text-ink md:text-[1.9rem] md:leading-[1.3]">
                  &ldquo;{note.quote}&rdquo;
                </blockquote>
                {note.body ? <p className="mt-6 leading-relaxed text-muted">{note.body}</p> : null}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {notes.length > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous note"
            className="grid size-12 place-items-center rounded-full border border-line bg-card transition hover:-rotate-6 hover:border-ink"
          >
            <ChevronIcon className="rotate-180" />
          </button>
          <div className="flex gap-2">
            {notes.map((n, i) => (
              <button
                key={n.id}
                type="button"
                aria-label={`Show note ${i + 1}`}
                aria-current={i === index}
                onClick={() => setState([i, i > index ? 1 : -1])}
                className={cn("h-2.5 rounded-full transition-all", i === index ? "w-6 bg-sage-deep" : "w-2.5 bg-line hover:bg-sage")}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next note"
            className="grid size-12 place-items-center rounded-full border border-line bg-card transition hover:rotate-6 hover:border-ink"
          >
            <ChevronIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
