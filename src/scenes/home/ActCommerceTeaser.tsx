"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Button } from "@/components/ui/Button";
import { Lines, Reveal } from "@/components/ui/Reveal";
import { Callout } from "@/components/ui/TechLabel";
import { products } from "@/data/products";
import { ProductObject } from "@/features/commerce/ProductObject";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { formatCurrency } from "@/lib/utils";
import { ParticleShape } from "@/three/state";

/** Act VI. Three conceptual packages as physical objects; the store proves the rest. */
export function ActCommerceTeaser() {
  const t = useTranslations("home.commerceTeaser");
  const tStore = useTranslations("store");
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);

  useSceneProgress(ref, {
    start: "top 80%",
    end: "top 20%",
    morph: { from: ParticleShape.ORBITS, to: ParticleShape.SPIRAL },
  });

  const featured = [products[0], products[2], products[4]];

  return (
    <section ref={ref} className="relative px-[var(--gutter)] py-32" data-layer="commerce" aria-labelledby="commerce-teaser-title">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Callout>{t("label")}</Callout>
        </div>
        <div className="lg:col-span-9">
          <Reveal as="h2" variant="lines" className="headline-lg">
            <span id="commerce-teaser-title">
              <Lines lines={t("title").split(". ").map((s, i, arr) => (i < arr.length - 1 ? `${s}.` : s))} />
            </span>
          </Reveal>
          <Reveal variant="blur" delay={0.2} className="mt-8 max-w-xl">
            <p className="body-lg">{t("body")}</p>
          </Reveal>
        </div>
      </div>

      <div className="mt-20 grid gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
        {featured.map((p, i) => {
          const variant = p.variants.find((v) => v.id === p.defaultVariant) ?? p.variants[0];
          return (
            <Reveal key={p.id} variant="blur" delay={i * 0.1} className="bg-obsidian">
              <TransitionLink href={`/store/${p.slug}`} transition="portal" className="group flex h-full flex-col justify-between gap-10 p-8 transition-colors hover:bg-white/[0.025]">
                <div className="flex items-start justify-between">
                  <span className="tech-label">{p.index}</span>
                  <span className="numeral text-[0.95rem] text-mist">{formatCurrency(variant.price, locale)}</span>
                </div>
                <div className="flex h-40 items-center justify-center">
                  <ProductObject layers={p.layers} tint={p.tint} size={140} interactive />
                </div>
                <div>
                  <h3 className="text-xl font-medium tracking-tight">{tStore(`products.${p.id}.name`)}</h3>
                  <p className="mt-1 text-[0.9rem] text-ash">{tStore(`products.${p.id}.tagline`)}</p>
                  <span className="underline-slide mt-5 inline-block text-[0.85rem] text-mist group-hover:text-pearl">{tStore("viewProduct")} →</span>
                </div>
              </TransitionLink>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <Button href="/store" variant="ghost" size="lg">
          {t("cta")}
        </Button>
      </div>
    </section>
  );
}
