"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { TechLabel } from "@/components/ui/TechLabel";
import { ParticleShape, renderState } from "@/three/state";

export function ErrorExperience({
  code,
  title,
  body,
  cta,
  href,
  reset,
}: {
  code: string;
  title: string;
  body: string;
  cta: string;
  href?: string;
  reset?: () => void;
}) {
  useEffect(() => {
    renderState.hero.visible = false;
    renderState.particles.from = ParticleShape.NAME;
    renderState.particles.to = ParticleShape.CHAOS;
    renderState.particles.mix = 0.55;
    renderState.particles.turbulence = 1.4;
    renderState.particles.opacity = 0.9;
    renderState.camera.z = 8.5;
    return () => {
      renderState.particles.turbulence = 0;
    };
  }, []);

  return (
    <main id="main" className="relative flex min-h-[100svh] flex-col items-center justify-center px-[var(--gutter)] text-center">
      <TechLabel tone="accent">{code}</TechLabel>
      <p className="chrome-text mt-6 font-medium tracking-[-0.06em] text-[clamp(5rem,18vw,12rem)] leading-none">{code}</p>
      <h1 className="headline-md mt-10 max-w-2xl">{title}</h1>
      <p className="body-lg mt-4 max-w-lg">{body}</p>
      <div className="mt-10">
        {href ? (
          <Button href={href}>{cta}</Button>
        ) : (
          <Button onClick={reset}>{cta}</Button>
        )}
      </div>
    </main>
  );
}
