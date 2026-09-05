"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Lines, Reveal } from "@/components/ui/Reveal";
import { Callout } from "@/components/ui/TechLabel";
import { ParticleShape, renderState } from "@/three/state";

/** Act II. A single editorial statement in the empty space the name left behind. */
export function ActStatement() {
  const t = useTranslations("home.statement");
  const ref = useRef<HTMLElement>(null);

  useSceneProgress(ref, {
    start: "top 80%",
    end: "top 10%",
    morph: { from: ParticleShape.ORBITS, to: ParticleShape.SPIRAL },
    cameraZ: { from: 6.4, to: 9.5 },
    onProgress: (p) => {
      renderState.particles.spin = 1 + p * 0.6;
    },
  });

  return (
    <section id="act-statement" ref={ref} className="relative flex min-h-[120svh] items-center px-[var(--gutter)] py-32" data-layer="content">
      <div className="grid w-full gap-12 lg:grid-cols-12">
        <div className="lg:col-span-2">
          <Callout>{t("label")}</Callout>
        </div>
        <div className="lg:col-span-10">
          <Reveal as="h2" variant="lines" className="headline-xl">
            <Lines lines={[t("line1"), t("line2")]} />
            <span className="block overflow-hidden">
              <span data-reveal-unit className="display-italic block text-mist">
                {t("line3")}
              </span>
            </span>
          </Reveal>
          <Reveal variant="blur" delay={0.3} className="mt-14 max-w-2xl lg:ml-[25%]">
            <p className="body-lg">{t("body")}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
