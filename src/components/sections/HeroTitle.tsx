"use client";
import { motion, useReducedMotion } from "motion/react";

/** Words slide up from behind a mask, then a hand-drawn line underlines the second line. */
export function HeroTitle({ line1, line2 }: { line1: string; line2: string }) {
  const reduce = useReducedMotion();
  const words1 = line1.split(" ");
  const words2 = line2.split(" ");

  const word = (w: string, i: number) => (
    <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <motion.span
        className="inline-block"
        initial={reduce ? false : { y: "110%", rotate: 6 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 + i * 0.08 }}
      >
        {w}
      </motion.span>
      {" "}
    </span>
  );

  return (
    <h1 className="text-[clamp(2.7rem,7.6vw,6.4rem)] font-normal leading-[0.95] tracking-[-0.035em] text-ink">
      <span className="block">{words1.map((w, i) => word(w, i))}</span>
      <span className="relative block italic text-sage-deep [font-variation-settings:'SOFT'_100]">
        {words2.map((w, i) => word(w, i + words1.length))}
        <svg
          aria-hidden
          viewBox="0 0 400 24"
          preserveAspectRatio="none"
          className="absolute -bottom-1 left-0 h-[0.28em] w-[min(100%,11ch)] text-kraft"
        >
          <motion.path
            d="M4 16 C 90 4, 180 22, 270 10 S 380 8, 396 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.9 }}
          />
        </svg>
      </span>
    </h1>
  );
}
