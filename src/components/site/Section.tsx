import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("relative scroll-mt-20 px-5 py-24 md:px-8 md:py-32", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** Plain text with blank-line paragraphs. React escapes everything, so no HTML gets through. */
export function Paragraphs({ text, className, firstClassName }: { text: string; className?: string; firstClassName?: string }) {
  const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className={cn("whitespace-pre-line", className, i === 0 && firstClassName)}>
          {p}
        </p>
      ))}
    </>
  );
}
