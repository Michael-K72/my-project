"use client";

import { useTranslations } from "next-intl";
import { useRef, type ReactNode } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Chars, Reveal } from "@/components/ui/Reveal";
import { Callout, TechLabel } from "@/components/ui/TechLabel";
import { cn } from "@/lib/utils";
import { ParticleShape, type ParticleShapeId } from "@/three/state";
import { BookingDemo, CommerceDemo, DataDemo, I18nDemo, MapsDemo, MotionDemo, ThreeDemo } from "./capabilities/demos";

type Item = {
  id: "motion" | "three" | "commerce" | "booking" | "data" | "maps" | "i18n";
  demo: ReactNode;
  /** Optional particle morph as this row enters. */
  morph?: { from: ParticleShapeId; to: ParticleShapeId };
};

const ITEMS: Item[] = [
  { id: "motion", demo: <MotionDemo />, morph: { from: ParticleShape.LATTICE, to: ParticleShape.WAVE } },
  { id: "three", demo: <ThreeDemo /> },
  { id: "commerce", demo: <CommerceDemo /> },
  { id: "booking", demo: <BookingDemo />, morph: { from: ParticleShape.WAVE, to: ParticleShape.RINGS } },
  { id: "data", demo: <DataDemo /> },
  { id: "maps", demo: <MapsDemo />, morph: { from: ParticleShape.RINGS, to: ParticleShape.GLOBE } },
  { id: "i18n", demo: <I18nDemo />, morph: { from: ParticleShape.GLOBE, to: ParticleShape.LATTICE } },
];

function Row({ item, index }: { item: Item; index: number }) {
  const t = useTranslations("home.capabilities.items");
  const ref = useRef<HTMLElement>(null);
  const flip = index % 2 === 1;

  useSceneProgress(ref, {
    start: "top 75%",
    end: "top 20%",
    morph: item.morph,
    enabled: Boolean(item.morph),
  });

  return (
    <article ref={ref} className="grid items-center gap-10 border-t border-[var(--line)] py-20 lg:grid-cols-12 lg:py-28">
      <div className={cn("lg:col-span-5", flip && "lg:order-2 lg:col-start-8")}>
        <TechLabel index={String(index + 1).padStart(2, "0")}>{t(`${item.id}.tag`)}</TechLabel>
        <Reveal as="h3" variant="chars" className="headline-lg mt-6">
          <Chars text={t(`${item.id}.title`)} />
        </Reveal>
        <Reveal variant="blur" delay={0.2} className="mt-6 max-w-md">
          <p className="body-lg">{t(`${item.id}.body`)}</p>
        </Reveal>
      </div>
      <Reveal variant="mask" delay={0.1} className={cn("lg:col-span-6", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-7")}>
        <div className="panel relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <span className="absolute left-3 top-3 h-2 w-2 border-l border-t border-[var(--line-strong)]" />
          <span className="absolute right-3 top-3 h-2 w-2 border-r border-t border-[var(--line-strong)]" />
          <span className="absolute bottom-3 left-3 h-2 w-2 border-b border-l border-[var(--line-strong)]" />
          <span className="absolute bottom-3 right-3 h-2 w-2 border-b border-r border-[var(--line-strong)]" />
          {item.demo}
        </div>
      </Reveal>
    </article>
  );
}

/** Act IV. Every capability is demonstrated live, not listed. */
export function ActCapabilities() {
  const t = useTranslations("home.capabilities");
  return (
    <section className="relative px-[var(--gutter)] py-24" data-layer="content" aria-labelledby="capabilities-title">
      <div className="grid gap-8 pb-8 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Callout>{t("label")}</Callout>
        </div>
        <Reveal as="h2" variant="lines" className="headline-lg lg:col-span-9">
          <span className="block overflow-hidden">
            <span data-reveal-unit id="capabilities-title" className="block">
              {t("title")}
            </span>
          </span>
        </Reveal>
      </div>
      {ITEMS.map((item, i) => (
        <Row key={item.id} item={item} index={i} />
      ))}
    </section>
  );
}
