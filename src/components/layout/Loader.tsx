"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ensureGsap, gsap } from "@/animations/gsap";
import { HERO_FONT_URL } from "@/three/HeroName";
import { useUI } from "@/stores/ui";
import { usePreferences } from "@/stores/preferences";

/**
 * Loader tied to real readiness (fonts + hero typeface), with a minimum dwell
 * short enough to never feel like a trap. Exits with an upward mask so the
 * hero appears to rise from beneath it.
 */
export function Loader() {
  const t = useTranslations("loader");
  const labels = t.raw("labels") as string[];
  const setLoaderDone = useUI((s) => s.setLoaderDone);
  const done = useUI((s) => s.loaderDone);
  const reduced = usePreferences((s) => s.motion === "reduced");
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [labelIndex, setLabelIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    ensureGsap();
    const state = { value: 0 };
    let ready = false;
    let finished = false;
    const started = performance.now();
    const minDwell = reduced ? 300 : 1400;

    const readiness = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      fetch(HERO_FONT_URL).then((r) => r.arrayBuffer()).catch(() => null),
    ]);
    readiness.then(() => {
      ready = true;
    });

    const render = () => {
      if (counter.current) counter.current.textContent = String(Math.round(state.value)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${state.value / 100})`;
      setLabelIndex(Math.min(labels.length - 1, Math.floor((state.value / 100) * labels.length)));
    };

    // Ease toward 88 while loading, then complete once ready and dwell satisfied.
    const creep = gsap.to(state, { value: 88, duration: 2.4, ease: "power2.out", onUpdate: render });

    const finish = () => {
      if (finished) return;
      finished = true;
      creep.kill();
      gsap.to(state, {
        value: 100,
        duration: 0.5,
        ease: "power3.inOut",
        onUpdate: render,
        onComplete: () => {
          const el = root.current;
          if (!el) return;
          gsap.to(el, {
            clipPath: "inset(0 0 100% 0)",
            duration: reduced ? 0.3 : 1.1,
            ease: "power4.inOut",
            delay: 0.15,
            onStart: () => setLoaderDone(),
            onComplete: () => setHidden(true),
          });
        },
      });
    };

    const interval = window.setInterval(() => {
      if (ready && performance.now() - started > minDwell) {
        window.clearInterval(interval);
        finish();
      }
    }, 80);
    // Hard cap – never trap the visitor.
    const cap = window.setTimeout(() => {
      window.clearInterval(interval);
      finish();
    }, 4500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(cap);
      creep.kill();
    };
  }, [labels.length, reduced, setLoaderDone]);

  if (hidden) return null;

  return (
    <div
      ref={root}
      aria-live="polite"
      aria-busy={!done}
      className="fixed inset-0 z-[95] flex flex-col justify-between bg-obsidian px-[var(--gutter)] py-8"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div className="flex items-center justify-between">
        <span className="tech-label">MK · BUILD 01</span>
        <span className="tech-label text-ash">{labels[labelIndex]}</span>
      </div>
      <div className="flex items-end justify-between gap-8">
        <span ref={counter} className="numeral font-medium text-pearl text-[clamp(4rem,14vw,12rem)] leading-none tabular-nums">
          000
        </span>
        <span className="tech-label mb-4 hidden sm:block">{t("ready")} →</span>
      </div>
      <div className="h-px w-full bg-[var(--line)]">
        <div ref={bar} className="h-px w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}
