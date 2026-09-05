"use client";

import { type ComponentProps, type MouseEvent } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useUI } from "@/stores/ui";
import { usePreferences } from "@/stores/preferences";
import { useTransition, type TransitionKind } from "./store";

type Props = ComponentProps<typeof Link> & {
  transition?: TransitionKind;
};

/** Duration the overlay needs to cover the viewport before navigation. */
export const TRANSITION_IN_MS = 420;

/**
 * Link that plays a cinematic overlay before routing. Falls back to a plain
 * navigation for modified clicks, external targets and reduced motion.
 */
export function TransitionLink({ transition = "mask", onClick, href, ...rest }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const begin = useTransition((s) => s.begin);
  const closeAll = useUI((s) => s.closeAll);
  const reduced = usePreferences((s) => s.motion === "reduced");

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const target = typeof href === "string" ? href : href.pathname ?? "";
    if (!target || target.startsWith("http") || target.startsWith("#")) return;
    if (target === pathname) {
      e.preventDefault();
      closeAll();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    e.preventDefault();
    closeAll();
    if (reduced) {
      router.push(href as never);
      return;
    }
    begin(transition, { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.setTimeout(() => router.push(href as never), TRANSITION_IN_MS);
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}
