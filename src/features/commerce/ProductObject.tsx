"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/preferences";

type Props = {
  layers: number;
  tint: string;
  size?: number;
  interactive?: boolean;
  className?: string;
  /** 0..1 exploded amount (layers separate in Z). */
  explode?: number;
};

/**
 * A product as a stack of interface planes in CSS 3D – the same visual
 * language as the configurator object, so the two systems read as one.
 */
export function ProductObject({ layers, tint, size = 160, interactive = false, className, explode = 0 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const reduced = usePreferences((s) => s.motion === "reduced");

  useEffect(() => {
    const el = root.current;
    const s = stack.current;
    if (!el || !s || !interactive || reduced) return;
    const rx = gsap.quickTo(s, "rotationX", { duration: 0.9, ease: "power3.out" });
    const rz = gsap.quickTo(s, "rotationZ", { duration: 0.9, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rx(58 - y * 18);
      rz(-30 + x * 30);
    };
    const onLeave = () => {
      rx(58);
      rz(-30);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [interactive, reduced]);

  const gap = 10 + explode * 26;

  return (
    <div ref={root} className={cn("flex items-center justify-center [perspective:900px]", className)} style={{ width: size, height: size }} data-cursor>
      <div
        ref={stack}
        className="relative [transform-style:preserve-3d] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)]"
        style={{ width: size * 0.72, height: size * 0.48, transform: "rotateX(58deg) rotateZ(-30deg)" }}
      >
        {Array.from({ length: layers }, (_, i) => {
          const top = i === layers - 1;
          return (
            <div
              key={i}
              className="absolute inset-0 rounded-[3px] border transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)]"
              style={{
                transform: `translateZ(${i * gap}px)`,
                borderColor: top ? tint : "rgba(236,233,226,0.45)",
                background: top ? `${tint}14` : "rgba(12,14,19,0.75)",
                boxShadow: i === 0 ? "0 30px 60px -20px rgba(0,0,0,0.9)" : undefined,
              }}
            >
              {top && (
                <>
                  <span className="absolute left-[10%] top-[18%] h-[6%] w-[40%] rounded-full" style={{ background: tint, opacity: 0.8 }} />
                  <span className="absolute left-[10%] top-[36%] h-[6%] w-[24%] rounded-full bg-pearl/40" />
                  <span className="absolute bottom-[16%] left-[10%] h-[14%] w-[26%] rounded-full bg-pearl/90" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
