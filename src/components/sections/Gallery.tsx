"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Photo, Tape } from "@/components/craft";
import { ChevronIcon, CloseIcon, PlayIcon } from "@/components/site/icons";
import type { MediaItem } from "@/lib/schemas";
import { cn, tapeColor, tilt } from "@/lib/utils";
import { youTubeEmbed, youTubeThumb } from "@/lib/youtube";

/** Masonry wall of photos and YouTube videos, with a keyboard-friendly lightbox. */
export function Gallery({ media, title }: { media: MediaItem[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + media.length) % media.length)), [media.length]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, close, step]);

  const current = open !== null ? media[open] : null;

  return (
    <>
      <ul className="columns-2 gap-5 md:columns-3 [&>li]:mb-6">
        {media.map((m, i) => (
          <li key={i} className="break-inside-avoid" style={{ rotate: `${tilt(i, 0.6)}deg` }}>
            <button
              type="button"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setOpen(i);
              }}
              className="polaroid polaroid-sm group block w-full text-left transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
              aria-label={`Open ${m.kind === "youtube" ? "video" : "photo"} ${i + 1}${m.caption ? `: ${m.caption}` : ""}`}
            >
              {i % 4 === 0 ? <Tape color={tapeColor(i)} className="-top-3 left-1/2 w-16 -translate-x-1/2 rotate-2" /> : null}
              <span className={cn("relative block overflow-hidden bg-paper-2", m.kind === "youtube" ? "aspect-video" : i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]")}>
                {m.kind === "image" ? (
                  <Photo image={m.image} sizes="(max-width: 768px) 50vw, 33vw" className="transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <Image src={youTubeThumb(m.youtubeId)} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" unoptimized />
                    <span className="absolute inset-0 grid place-items-center bg-ink/20 transition group-hover:bg-ink/10">
                      <span className="grid size-14 place-items-center rounded-full bg-card/95 text-ink shadow-lg transition group-hover:scale-110">
                        <PlayIcon />
                      </span>
                    </span>
                  </>
                )}
              </span>
              <span className="flex h-8 items-center justify-center px-2 text-center font-hand text-lg leading-none text-charcoal">
                {m.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title}: ${current.kind === "youtube" ? "video" : "photo"} ${open! + 1} of ${media.length}`}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && close()}
            data-lenis-prevent
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-card text-ink"
            >
              <CloseIcon />
            </button>
            {media.length > 1 ? (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous" className="absolute left-3 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-ink">
                  <ChevronIcon className="rotate-180" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next" className="absolute right-3 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-ink">
                  <ChevronIcon />
                </button>
              </>
            ) : null}

            <motion.figure
              key={open}
              initial={{ scale: 0.92, rotate: -2, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className={cn(
                "w-full bg-card p-2 pb-3 sm:p-3",
                current.kind === "youtube" ? "max-w-[min(64rem,calc((100dvh-8rem)*16/9))]" : "max-w-5xl",
              )}
            >
              {current.kind === "image" ? (
                <div className="relative h-[70vh] w-full bg-ink/5">
                  <Photo image={current.image} sizes="100vw" className="!object-contain" />
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-ink">
                  <iframe
                    src={youTubeEmbed(current.youtubeId)}
                    title={current.caption || "YouTube video"}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              )}
              <figcaption className="flex items-center justify-between gap-4 px-2 pt-3">
                <span className="font-hand text-2xl text-ink">{current.caption}</span>
                <span className="font-mono text-xs text-muted">
                  {open! + 1} / {media.length}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
