"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { renderState } from "@/three/state";

/**
 * Scroll progress as a tiny orbit: a dot travels around a hairline circle,
 * the arc fills behind it. Updated directly from the render state each frame.
 */
export function ScrollOrbit({ size = 28 }: { size?: number }) {
  const dot = useRef<SVGCircleElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const value = useRef<HTMLSpanElement>(null);
  const t = useTranslations("a11y");
  const r = size / 2 - 2;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const p = renderState.scroll;
      if (Math.abs(p - last) > 0.0005) {
        last = p;
        const a = p * Math.PI * 2 - Math.PI / 2;
        dot.current?.setAttribute("cx", String(size / 2 + Math.cos(a) * r));
        dot.current?.setAttribute("cy", String(size / 2 + Math.sin(a) * r));
        arc.current?.setAttribute("stroke-dashoffset", String(c * (1 - p)));
        if (value.current) value.current.textContent = `${Math.round(p * 100)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [c, r, size]);

  return (
    <div className="flex items-center gap-2" role="progressbar" aria-label={t("scrollProgress")} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle
          ref={arc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray={c}
          strokeDashoffset={c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={0.7}
        />
        <circle ref={dot} cx={size / 2} cy={2} r="1.8" fill="var(--accent)" />
      </svg>
      <span ref={value} className="tech-label-sm hidden w-5 text-right md:inline-block">
        0
      </span>
    </div>
  );
}
