import { cn } from "@/lib/utils";

export function Logo({
  className,
  markClass,
}: {
  className?: string;
  markClass?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg
        viewBox="0 0 24 24"
        className={cn("size-5 shrink-0", markClass)}
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" className="text-primary" />
        <path
          d="M9.2 16.2V8.4h2.15c1.72 0 2.78.86 2.78 2.28 0 1.44-1.08 2.34-2.82 2.34H10.5v3.18H9.2Zm1.3-4.32h.78c.9 0 1.42-.46 1.42-1.16 0-.7-.5-1.12-1.4-1.12H10.5v2.28Z"
          fill="var(--primary-foreground)"
        />
      </svg>
      <span>
        Petro<span className="font-normal text-muted-foreground">Office</span>
      </span>
    </span>
  );
}
