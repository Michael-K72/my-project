"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Button } from "@/components/ui/Button";
import { TechLabel } from "@/components/ui/TechLabel";
import { identity } from "@/config/identity";
import { cn } from "@/lib/utils";
import { useUI } from "@/stores/ui";
import { ParticleShape, renderState } from "@/three/state";

/**
 * Act I. The 3D name lives in the global canvas; this component frames it with
 * minimal HTML and drives the disassembly via scroll progress across 220vh.
 */
export function ActHero() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const loaderDone = useUI((s) => s.loaderDone);

  useEffect(() => {
    renderState.hero.visible = true;
    renderState.hero.progress = 0;
    renderState.camera.z = 9;
    renderState.particles.opacity = 1;
    renderState.particles.from = ParticleShape.CHAOS;
    renderState.particles.to = ParticleShape.CHAOS;
    renderState.particles.mix = 0;
    renderState.particles.scale = 1;
    return () => {
      renderState.hero.visible = false;
    };
  }, []);

  useSceneProgress(ref, {
    start: "top top",
    end: "bottom bottom",
    morph: { from: ParticleShape.CHAOS, to: ParticleShape.ORBITS },
    cameraZ: { from: 9, to: 6.4 },
    onProgress: (p) => {
      renderState.hero.progress = p;
      if (frame.current) {
        const fade = Math.max(0, 1 - p * 2.4);
        frame.current.style.opacity = String(fade);
        frame.current.style.transform = `translate3d(0, ${-p * 80}px, 0)`;
      }
    },
  });

  return (
    <section ref={ref} className="relative h-[220svh]" aria-labelledby="hero-title" data-layer="content">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-[var(--gutter)] pb-8 pt-28 md:pb-10">
        <h1 id="hero-title" className="sr-only">
          {t("srTitle")}
        </h1>

        <div
          ref={frame}
          className={cn(
            "flex flex-1 flex-col justify-between transition-opacity duration-1000 [transition-timing-function:var(--ease-out-expo)]",
            loaderDone ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="flex items-start justify-between">
            <TechLabel dot>{t("eyebrow")}</TechLabel>
            <TechLabel className="text-right">{identity.build}</TechLabel>
          </div>

          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col gap-3">
              <span className="tech-label">{t("disciplines")}</span>
              <span className="text-[0.875rem] text-ash">{t("location")}</span>
            </div>
            <div className="hidden flex-col items-center gap-2 md:flex">
              <span className="tech-label-sm">{t("scroll")}</span>
              <span className="relative h-10 w-px overflow-hidden bg-[var(--line)]">
                <span className="absolute inset-x-0 top-0 h-3 animate-[scrollhint_2.2s_var(--ease-in-out-quart)_infinite] bg-accent" />
              </span>
            </div>
            <div className="flex md:justify-end">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  const next = document.getElementById("act-statement");
                  next?.scrollIntoView({ behavior: renderState.reducedMotion ? "auto" : "smooth" });
                }}
              >
                {t("cta")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes scrollhint { 0% { transform: translateY(-100%); } 60%, 100% { transform: translateY(400%); } }`}</style>
    </section>
  );
}
