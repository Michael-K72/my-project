"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Callout } from "@/components/ui/TechLabel";
import { PortalDashboard } from "@/features/portal/PortalDashboard";
import { range, smoothstep } from "@/lib/utils";
import { ParticleShape } from "@/three/state";

/** Act VIII. The client portal enters as a tilted plane and settles flat. */
export function ActPortalTeaser() {
  const t = useTranslations("home.portalTeaser");
  const ref = useRef<HTMLElement>(null);
  const plane = useRef<HTMLDivElement>(null);

  useSceneProgress(ref, {
    start: "top 90%",
    end: "top 10%",
    morph: { from: ParticleShape.GLOBE, to: ParticleShape.LATTICE },
    cameraZ: { from: 7.4, to: 10 },
    onProgress: (p) => {
      const a = smoothstep(range(p, 0.15, 0.85));
      if (plane.current) {
        plane.current.style.transform = `perspective(1600px) rotateX(${(1 - a) * 22}deg) translateY(${(1 - a) * 80}px) scale(${0.92 + a * 0.08})`;
        plane.current.style.opacity = String(0.2 + a * 0.8);
      }
    },
  });

  return (
    <section ref={ref} className="relative px-[var(--gutter)] py-32" data-layer="data" aria-labelledby="portal-teaser-title">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Callout>{t("label")}</Callout>
        </div>
        <div className="lg:col-span-6">
          <Reveal as="h2" variant="mask" className="headline-lg">
            <span id="portal-teaser-title">{t("title")}</span>
          </Reveal>
          <Reveal variant="blur" delay={0.15} className="mt-6 max-w-xl">
            <p className="body-lg">{t("body")}</p>
          </Reveal>
        </div>
        <div className="flex items-end lg:col-span-3 lg:justify-end">
          <Button href="/portal" variant="ghost">
            {t("cta")}
          </Button>
        </div>
      </div>

      <div ref={plane} className="mt-16 origin-top will-change-transform" style={{ transform: "perspective(1600px) rotateX(22deg) translateY(80px) scale(0.92)", opacity: 0.2 }}>
        <PortalDashboard compact />
      </div>
    </section>
  );
}
