"use client";
import Lenis from "lenis";
import { useEffect } from "react";

/** Buttery scrolling on the public site. Skipped when the visitor prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -72 }, autoRaf: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
