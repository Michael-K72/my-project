"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Button } from "@/components/ui/Button";
import { Callout, TechLabel } from "@/components/ui/TechLabel";
import { range, smoothstep } from "@/lib/utils";
import { ParticleShape, renderState } from "@/three/state";

/** Act VII. The universe becomes a globe; labels attach to it like survey marks. */
export function ActNetwork() {
  const t = useTranslations("home.network");
  const tNet = useTranslations("network");
  const ref = useRef<HTMLElement>(null);
  const labels = useRef<Array<HTMLDivElement | null>>([]);
  const copy = useRef<HTMLDivElement>(null);

  useSceneProgress(ref, {
    start: "top top",
    end: "bottom bottom",
    morph: { from: ParticleShape.SPIRAL, to: ParticleShape.GLOBE },
    cameraZ: { from: 10.5, to: 7.4 },
    onProgress: (p) => {
      renderState.particles.spin = 1.4;
      labels.current.forEach((el, i) => {
        if (!el) return;
        const a = smoothstep(range(p, 0.45 + i * 0.1, 0.6 + i * 0.1));
        el.style.opacity = String(a);
        el.style.transform = `translate3d(${(1 - a) * 20}px,0,0)`;
      });
      if (copy.current) {
        const a = smoothstep(range(p, 0.3, 0.55));
        copy.current.style.opacity = String(a);
        copy.current.style.transform = `translate3d(0,${(1 - a) * 24}px,0)`;
      }
    },
  });

  const marks = [
    { key: "available", pos: "left-[8%] top-[30%]" },
    { key: "remote", pos: "right-[8%] top-[42%]" },
    { key: "region", pos: "left-[12%] bottom-[28%]" },
  ] as const;

  return (
    <section ref={ref} className="relative h-[240svh]" data-layer="content" aria-labelledby="network-title">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-[var(--gutter)] pb-10 pt-28">
        <Callout>{t("label")}</Callout>

        <div className="relative flex-1">
          {marks.map((m, i) => (
            <div
              key={m.key}
              ref={(el) => {
                labels.current[i] = el;
              }}
              className={`absolute ${m.pos} flex items-center gap-3 opacity-0`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px_var(--accent-glow)]" />
              <span className="h-px w-10 bg-[var(--line-strong)]" />
              <TechLabel>{tNet(`labels.${m.key}`)}</TechLabel>
            </div>
          ))}
        </div>

        <div ref={copy} className="flex flex-col gap-6 opacity-0 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 id="network-title" className="headline-lg">
              {t("title")}
            </h2>
            <p className="body-lg mt-4">{t("body")}</p>
          </div>
          <Button href="/network" variant="ghost" size="lg">
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
