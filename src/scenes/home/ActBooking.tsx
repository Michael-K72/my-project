"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Callout } from "@/components/ui/TechLabel";
import { OrbitCalendar } from "@/features/booking/OrbitCalendar";
import { useRouter } from "@/i18n/navigation";
import { ParticleShape, renderState } from "@/three/state";

/** Act IX. The orbit calendar itself – selecting a date continues in /book. */
export function ActBooking() {
  const t = useTranslations("home.booking");
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();

  useSceneProgress(ref, {
    start: "top 85%",
    end: "top 15%",
    morph: { from: ParticleShape.LATTICE, to: ParticleShape.RINGS },
    cameraZ: { from: 10, to: 9 },
    onProgress: () => {
      renderState.particles.spin = 0.8;
    },
  });

  return (
    <section ref={ref} className="relative px-[var(--gutter)] py-32" data-layer="interaction" aria-labelledby="booking-title">
      <div className="grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Callout>{t("label")}</Callout>
          <Reveal as="h2" variant="mask" className="headline-lg mt-8">
            <span id="booking-title">{t("title")}</span>
          </Reveal>
          <Reveal variant="blur" delay={0.15} className="mt-6 max-w-md">
            <p className="body-lg">{t("body")}</p>
          </Reveal>
          <div className="mt-10">
            <Button href="/book" variant="ghost">
              {t("cta")}
            </Button>
          </div>
        </div>
        <Reveal variant="blur" delay={0.1} className="lg:col-span-7">
          <OrbitCalendar
            compact
            onSelect={(iso) => router.push({ pathname: "/book", query: { date: iso } })}
          />
        </Reveal>
      </div>
    </section>
  );
}
