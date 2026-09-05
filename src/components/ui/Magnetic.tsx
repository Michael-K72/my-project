"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { gsap } from "@/animations/gsap";
import { usePreferences } from "@/stores/preferences";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Maximum displacement in px. */
  strength?: number;
  className?: string;
};

/**
 * Magnetic wrapper: the child eases toward the pointer within its bounds and
 * springs back on leave. Uses GSAP quickTo for zero-allocation updates.
 */
export function Magnetic({ children, strength = 14, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePreferences((s) => s.motion === "reduced");
  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const ensure = () => {
    if (!ref.current || xTo.current) return;
    xTo.current = gsap.quickTo(ref.current, "x", { duration: 0.6, ease: "power3.out" });
    yTo.current = gsap.quickTo(ref.current, "y", { duration: 0.6, ease: "power3.out" });
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    ensure();
    const rect = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    xTo.current?.(dx * strength);
    yTo.current?.(dy * strength);
  };

  const onLeave = () => {
    xTo.current?.(0);
    yTo.current?.(0);
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
