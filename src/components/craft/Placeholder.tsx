import { cn, initials } from "@/lib/utils";

/** Shown when no photo has been uploaded yet: Karakoram peaks in sage, with initials. */
export function Placeholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden bg-sage-soft", className)}>
      <svg aria-hidden viewBox="0 0 200 150" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <circle cx="150" cy="38" r="14" fill="#f6e9b2" />
        <path d="M0 150 L48 70 L72 102 L110 44 L150 108 L172 84 L200 120 V150 Z" fill="#b9c79c" />
        <path d="M110 44 L122 63 L112 60 L104 68 L98 62 Z" fill="#fffdf8" opacity=".9" />
        <path d="M0 150 L36 118 L70 134 L118 104 L160 130 L200 116 V150 Z" fill="#7b8f55" />
      </svg>
      {label ? (
        <span className="relative font-display text-3xl text-sage-deep/80 drop-shadow-[0_1px_0_rgba(255,255,255,.6)]">
          {initials(label)}
        </span>
      ) : null}
    </div>
  );
}
