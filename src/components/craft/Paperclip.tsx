import { cn } from "@/lib/utils";

export function Paperclip({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 110" className={cn("absolute z-[5] h-24 w-9 drop-shadow", className)} fill="none">
      <path
        d="M27 30V82a10 10 0 0 1-20 0V20a14 14 0 0 1 28 0v56a6 6 0 0 1-12 0V30"
        stroke="#9aa77f"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
