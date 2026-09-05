"use client";

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { ensureGsap, gsap, ScrollTrigger } from "@/animations/gsap";
import { usePreferences } from "@/stores/preferences";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** "mask" clips from the bottom; "blur" resolves from blur + depth; "chars" staggers characters (string children only). */
  variant?: "mask" | "blur" | "chars" | "lines";
  once?: boolean;
  /** ScrollTrigger start; defaults to 82% down the viewport. */
  start?: string;
};

/**
 * Viewport-triggered reveal built on ScrollTrigger so it shares the scroll
 * source with every other animation. Reduced motion → short crossfade.
 */
export function Reveal({ children, as: Tag = "div", className, delay = 0, variant = "mask", once = true, start = "top 85%" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePreferences((s) => s.motion === "reduced");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureGsap();

    const targets = variant === "chars" || variant === "lines" ? Array.from(el.querySelectorAll<HTMLElement>("[data-reveal-unit]")) : [el];
    if (targets.length === 0) return;

    if (reduced) {
      gsap.set(targets, { clearProps: "all", opacity: 0 });
      const st = ScrollTrigger.create({
        trigger: el,
        start,
        once,
        onEnter: () => gsap.to(targets, { opacity: 1, duration: 0.5, stagger: 0.02, delay }),
      });
      return () => st.kill();
    }

    const from =
      variant === "blur"
        ? { opacity: 0, filter: "blur(14px)", y: 24, z: -80 }
        : variant === "chars"
          ? { yPercent: 110, rotateX: -40, opacity: 0 }
          : variant === "lines"
            ? { yPercent: 105, opacity: 0 }
            : { clipPath: "inset(0 0 100% 0)", y: 30 };
    const to =
      variant === "blur"
        ? { opacity: 1, filter: "blur(0px)", y: 0, z: 0, duration: 1.2, ease: "expo.out" }
        : variant === "chars"
          ? { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.022 }
          : variant === "lines"
            ? { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.09 }
            : { clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.15, ease: "expo.out" };

    gsap.set(targets, from);
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      once,
      onEnter: () => gsap.to(targets, { ...to, delay }),
      onLeaveBack: once ? undefined : () => gsap.set(targets, from),
    });
    return () => st.kill();
  }, [variant, reduced, delay, once, start]);

  return createElement(
    Tag,
    { ref, className: cn(variant === "chars" || variant === "lines" ? "[perspective:900px]" : "", className) },
    children,
  );
}

/** Splits a string into per-character spans for `Reveal variant="chars"`. */
export function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-block", className)} aria-label={text} role="text">
      {Array.from(text).map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden align-baseline" aria-hidden="true">
          <span data-reveal-unit className="inline-block will-change-transform [transform-style:preserve-3d]">
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Wraps each line in a masked block for `Reveal variant="lines"`. */
export function Lines({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={cn("block overflow-hidden", className)}>
          <span data-reveal-unit className="block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </>
  );
}
