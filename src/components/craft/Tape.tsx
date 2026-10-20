import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = { className?: string; color?: string; style?: CSSProperties };

/** A strip of washi tape. Position it with className (e.g. "-top-3 left-1/2 -translate-x-1/2 -rotate-3"). */
export function Tape({ className, color = "", style }: Props) {
  return <span aria-hidden className={cn("tape", color, className)} style={style} />;
}
