import type { ReactNode } from "react";
import type { ImageRef } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Photo } from "./Photo";
import { Tape } from "./Tape";

type Props = {
  image?: ImageRef | null;
  caption?: ReactNode;
  sizes?: string;
  aspect?: string;
  className?: string;
  tape?: string | false;
  small?: boolean;
  fallbackLabel?: string;
  priority?: boolean;
};

export function Polaroid({
  image,
  caption,
  sizes = "(max-width: 768px) 50vw, 25vw",
  aspect = "aspect-[4/5]",
  className,
  tape = "",
  small,
  fallbackLabel,
  priority,
}: Props) {
  return (
    <figure className={cn("polaroid", small && "polaroid-sm", className)}>
      {tape !== false ? <Tape color={tape} className="-top-3 left-1/2 -translate-x-1/2 -rotate-2" /> : null}
      <div className={cn("relative overflow-hidden bg-paper-2", aspect)}>
        <Photo image={image} sizes={sizes} fallbackLabel={fallbackLabel} priority={priority} />
      </div>
      {caption ? (
        <figcaption
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center justify-center px-2 text-center font-hand leading-none text-charcoal",
            small ? "h-8 text-lg" : "h-11 text-2xl",
          )}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
