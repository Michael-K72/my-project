import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  index?: string;
  className?: string;
  tone?: "default" | "accent" | "muted";
  dot?: boolean;
};

/** Small monospaced annotation used near scenes and objects. */
export function TechLabel({ children, index, className, tone = "default", dot }: Props) {
  return (
    <span
      className={cn(
        "tech-label inline-flex items-center gap-3",
        tone === "accent" && "text-accent",
        tone === "muted" && "text-ash",
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent-glow)] animate-pulse-soft" />}
      {index && <span className="text-ash">{index}</span>}
      {children}
    </span>
  );
}

/** Thin horizontal rule with a label – an engineering drawing callout. */
export function Callout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="h-px w-10 bg-[var(--line-strong)]" />
      <TechLabel>{children}</TechLabel>
    </div>
  );
}

/** Crosshair marker used in technical compositions. */
export function Marker({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("crosshair relative block h-3 w-3", className)} />;
}
