import type { ReactNode } from "react";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { cn, pad2 } from "@/lib/utils";

type Props = {
  number: number;
  label: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

/** "08 — A NOTE" rule, then a centred eyebrow + serif title, like a page in a zine. */
export function SectionHeader({ number, label, eyebrow, title, intro, align = "center", className }: Props) {
  return (
    <header className={cn("mb-12 md:mb-16", className)}>
      <div className="mb-10 flex items-center gap-4">
        <ScrambleText text={`${pad2(number)} — ${label}`} className="eyebrow shrink-0 font-semibold" />
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}>
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2 className="text-balance text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl">{title}</h2>
        {intro ? <div className="mt-5 text-pretty text-lg leading-relaxed text-muted">{intro}</div> : null}
      </div>
    </header>
  );
}
