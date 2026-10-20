"use client";
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Final resting angle in degrees (hand-placed look). */
  rotate?: number;
  delay?: number;
  /** "rise" floats up; "drop" falls onto the board like it's being pinned. */
  variant?: "rise" | "drop" | "fade";
  /** Straighten and lift on hover. */
  lift?: boolean;
};

export function Reveal({ children, className, style, rotate = 0, delay = 0, variant = "rise", lift = false }: Props) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} style={{ ...style, rotate: `${rotate}deg` }}>
        {children}
      </div>
    );
  }
  const initial =
    variant === "drop"
      ? { opacity: 0, y: -50, scale: 1.08, rotate: rotate - 6 }
      : variant === "fade"
        ? { opacity: 0, rotate }
        : { opacity: 0, y: 44, rotate: rotate + 3 };
  return (
    <motion.div
      className={className}
      style={style}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate }}
      whileHover={lift ? { rotate: 0, y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 18 } } : undefined}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ type: "spring", stiffness: 140, damping: 17, mass: 0.9, delay }}
    >
      {children}
    </motion.div>
  );
}
