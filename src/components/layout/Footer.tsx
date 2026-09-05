"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { identity } from "@/config/identity";
import { legalNavigation } from "@/config/navigation";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { ParticleShape, renderState, type ParticleShapeId } from "@/three/state";
import { Button } from "../ui/Button";
import { TechLabel } from "../ui/TechLabel";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = {
  /** Shape the universe is in before the footer pulls it into the name. */
  from?: ParticleShapeId;
};

/**
 * The footer is the final scene: the universe collapses toward the centre and
 * re-forms the name. Metadata sits at the edges so the centre stays empty.
 */
export function Footer({ from = ParticleShape.ORBITS }: Props) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const ref = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  useSceneProgress(ref, {
    start: "top 90%",
    end: "top 5%",
    morph: { from, to: ParticleShape.NAME },
    cameraZ: { from: renderState.camera.z || 10, to: 8.6 },
    onProgress: (p) => {
      const aspect = window.innerWidth / window.innerHeight;
      const visibleWidth = 2 * Math.tan((42 / 2) * (Math.PI / 180)) * 8.6 * aspect;
      renderState.particles.scale = Math.min(1, visibleWidth / 8.6);
      renderState.particles.opacity = 0.55 + p * 0.45;
      renderState.particles.spin = 1 - p * 0.9;
      if (nameRef.current) nameRef.current.style.opacity = String(Math.max(0, (p - 0.75) / 0.25) * 0.22);
    },
  });

  return (
    <footer ref={ref} className="relative min-h-[100svh] flex flex-col justify-between px-[var(--gutter)] pb-8 pt-24" data-layer="content">
      <div className="flex items-start justify-between">
        <TechLabel dot>{t("discipline")}</TechLabel>
        <TechLabel className="text-right">
          {t("location")} · {t("availability")}
        </TechLabel>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div ref={nameRef} aria-hidden="true" className="pointer-events-none select-none opacity-0 transition-opacity duration-300">
          <span className="chrome-text block font-medium tracking-[-0.05em] text-[clamp(2.6rem,9.2vw,9.5rem)] leading-[0.9]">{identity.nameLines[0]}</span>
          <span className="chrome-text block font-medium tracking-[-0.05em] text-[clamp(2.6rem,9.2vw,9.5rem)] leading-[0.9]">{identity.nameLines[1]}</span>
        </div>
        <h2 className="sr-only">{identity.name}</h2>
        <div className="mt-[20vh] flex flex-col items-center gap-6">
          <p className="headline-md max-w-3xl text-pearl">{t("cta")}</p>
          <Button href="/contact" size="lg" variant="primary">
            {t("ctaButton")}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 border-t border-[var(--line)] pt-6 md:grid-cols-3 md:items-end">
        <div className="space-y-3">
          <span className="tech-label-sm block">{t("language")}</span>
          <LanguageSwitcher variant="full" />
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center">
          {legalNavigation.map((l) => (
            <li key={l.id}>
              <TransitionLink href={l.href} className="tech-label-sm underline-slide hover:text-mist">
                {tNav(l.labelKey)}
              </TransitionLink>
            </li>
          ))}
          <li>
            <TransitionLink href="/contact" className="tech-label-sm underline-slide hover:text-mist">
              {tNav("contact")}
            </TransitionLink>
          </li>
        </ul>
        <div className="flex flex-col gap-2 md:items-end">
          <a href={`mailto:${identity.contact.email}`} className="underline-slide text-[0.875rem] text-mist hover:text-pearl">
            {identity.contact.email}
          </a>
          <span className="tech-label-sm">
            © {new Date().getFullYear()} {identity.name} · {t("rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
