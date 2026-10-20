import { cn } from "@/lib/utils";

export function Pin({ className, color = "" }: { className?: string; color?: string }) {
  return <span aria-hidden className={cn("pin", color, className)} />;
}
