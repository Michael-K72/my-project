"use client";

import { useEffect, useRef, useState } from "react";
import { clientFeatures } from "@/config/features";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/preferences";
import { useUI } from "@/stores/ui";

/**
 * Desktop-only cursor. A small dot follows instantly; a ring lags behind and
 * grows on interactive targets. The native cursor stays available on inputs.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const variant = useUI((s) => s.cursor);
  const label = useUI((s) => s.cursorLabel);
  const reduced = usePreferences((s) => s.motion === "reduced");
  const [enabled, setEnabled] = useState(false);
  const [hoverInteractive, setHoverInteractive] = useState(false);

  useEffect(() => {
    if (!clientFeatures.customCursor) return;
    const fine = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(hover: none)").matches;
    if (!fine || reduced) {
      document.documentElement.removeAttribute("data-cursor");
      setEnabled(false);
      return;
    }
    setEnabled(true);
    document.documentElement.setAttribute("data-cursor", "custom");

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target as HTMLElement | null;
      const interactive = Boolean(target?.closest("a, button, [role='button'], [role='option'], input, textarea, select, label, [data-cursor]"));
      setHoverInteractive(interactive);
      const isText = Boolean(target?.closest("input, textarea, select"));
      document.documentElement.setAttribute("data-cursor", isText ? "native" : "custom");
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeAttribute("data-cursor");
    };
  }, [reduced]);

  if (!enabled) return null;

  const showLabel = label && (variant === "view" || variant === "drag" || variant === "open" || variant === "select");
  const large = hoverInteractive || variant !== "default";

  return (
    <>
      <div ref={dot} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-pearl mix-blend-difference" />
      <div
        ref={ring}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full border border-pearl/60 transition-[width,height,margin,background-color,border-color] duration-400 [transition-timing-function:var(--ease-out-expo)]",
          large ? "-ml-6 -mt-6 h-12 w-12 border-pearl/30" : "-ml-3.5 -mt-3.5 h-7 w-7",
          showLabel && "-ml-9 -mt-9 h-18 w-18 border-transparent bg-pearl/90",
          variant === "hidden" && "opacity-0",
        )}
      >
        {showLabel && <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-obsidian">{label}</span>}
      </div>
    </>
  );
}
