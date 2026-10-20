import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode; color?: string; className?: string; style?: CSSProperties };

export function StickyNote({ children, color = "sticky-butter", className, style }: Props) {
  return (
    <div className={cn("sticky p-5", color, className)} style={style}>
      {children}
    </div>
  );
}
