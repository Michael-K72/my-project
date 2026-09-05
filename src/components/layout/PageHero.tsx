import { Callout } from "@/components/ui/TechLabel";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHero({
  label,
  title,
  body,
  badge,
  light,
}: {
  label: string;
  title: string;
  body?: string;
  badge?: ReactNode;
  light?: boolean;
}) {
  return (
    <header className={cn("px-[var(--gutter)] pb-16 pt-32 md:pt-40", light && "text-obsidian")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Callout>{label}</Callout>
        {badge}
      </div>
      <h1 className="headline-xl mt-8 max-w-5xl">{title}</h1>
      {body && <p className="body-lg mt-8 max-w-2xl">{body}</p>}
    </header>
  );
}
