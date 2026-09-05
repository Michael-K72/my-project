"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Button } from "@/components/ui/Button";
import { Callout, TechLabel } from "@/components/ui/TechLabel";
import { range, smoothstep } from "@/lib/utils";
import { ParticleShape, renderState } from "@/three/state";

const LAYER_LABELS = ["CORE", "COMMERCE", "3D ORBIT", "BOOKING", "I18N", "DATA"];

/**
 * Act V. Portal transition: a framed preview of the configurator's growing
 * object approaches the camera until the frame becomes the viewport.
 */
export function ActConfiguratorTeaser() {
  const t = useTranslations("home.configuratorTeaser");
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const object = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useSceneProgress(ref, {
    start: "top top",
    end: "bottom bottom",
    morph: { from: ParticleShape.LATTICE, to: ParticleShape.ORBITS },
    onProgress: (p) => {
      // Frame grows from a card to the full viewport between 10–70%.
      const grow = smoothstep(range(p, 0.08, 0.7));
      const scale = 0.58 + grow * 0.42;
      const radius = 24 - grow * 24;
      if (frame.current) {
        frame.current.style.transform = `scale(${scale})`;
        frame.current.style.borderRadius = `${radius}px`;
        frame.current.style.borderColor = `rgba(255,255,255,${0.16 - grow * 0.16})`;
      }
      // Object grows layer by layer; final layer at ~80%.
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = smoothstep(range(p, 0.15 + i * 0.1, 0.28 + i * 0.1));
        el.style.opacity = String(a);
        el.style.transform = `translate3d(0,0,${i * 26}px) scale(${0.7 + a * 0.3})`;
      });
      if (object.current) object.current.style.transform = `rotateX(${58 - p * 10}deg) rotateZ(${-30 + p * 40}deg)`;
      if (copy.current) {
        const show = smoothstep(range(p, 0.6, 0.85));
        copy.current.style.opacity = String(show);
        copy.current.style.transform = `translate3d(0,${(1 - show) * 30}px,0)`;
      }
      renderState.camera.z = 8.2 + p * 2.5;
    },
  });

  return (
    <section ref={ref} className="relative h-[260svh]" data-layer="content" aria-labelledby="configurator-teaser-title">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-[var(--gutter)]">
        <div className="absolute left-[var(--gutter)] top-28">
          <Callout>{t("label")}</Callout>
        </div>

        <div
          ref={frame}
          className="relative flex h-[100svh] w-full flex-col items-center justify-center border border-[var(--line-strong)] bg-[radial-gradient(ellipse_at_50%_60%,rgba(20,24,32,0.9),rgba(5,6,9,1)_75%)] [transform-origin:50%_50%] will-change-transform"
          style={{ transform: "scale(0.58)", borderRadius: 24 }}
        >
          <div className="absolute inset-0 grid-fragment opacity-60" />
          <div className="absolute left-6 top-6 flex items-center gap-3">
            <TechLabel>CONFIG · 05</TechLabel>
          </div>
          <div className="absolute right-6 top-6 hidden gap-2 md:flex">
            {LAYER_LABELS.map((l) => (
              <span key={l} className="tech-label-sm">
                {l}
              </span>
            ))}
          </div>

          <div className="relative flex h-[46vh] w-full items-center justify-center [perspective:1600px]">
            <div ref={object} className="relative h-[220px] w-[320px] [transform-style:preserve-3d]" style={{ transform: "rotateX(58deg) rotateZ(-30deg)" }}>
              {LAYER_LABELS.map((label, i) => (
                <div
                  key={label}
                  ref={(el) => {
                    layerRefs.current[i] = el;
                  }}
                  className="absolute inset-0 rounded-md border opacity-0 [transform-style:preserve-3d]"
                  style={{
                    borderColor: i === 0 ? "rgba(236,233,226,0.9)" : `rgba(191,227,255,${0.75 - i * 0.08})`,
                    background: i === 0 ? "rgba(12,14,19,0.9)" : "rgba(191,227,255,0.04)",
                    boxShadow: i === 0 ? "0 40px 80px -30px rgba(0,0,0,0.9)" : undefined,
                  }}
                >
                  {i === 2 && <span className="absolute inset-[-14%] rounded-full border border-dashed border-accent/50" />}
                  {i === 3 && <span className="absolute inset-[6%] rounded-full border border-accent/40" />}
                  {i === 5 && (
                    <span className="absolute inset-0">
                      {Array.from({ length: 14 }, (_, k) => (
                        <span
                          key={k}
                          className="absolute h-1 w-1 rounded-full bg-accent"
                          style={{ left: `${(k * 37) % 100}%`, top: `${(k * 53) % 100}%`, opacity: 0.5 + ((k * 7) % 5) / 10 }}
                        />
                      ))}
                    </span>
                  )}
                  <span className="tech-label-sm absolute -right-24 top-1/2 w-20 -translate-y-1/2 text-left [transform:rotateZ(30deg)_rotateX(-58deg)]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={copy} className="relative mt-4 flex max-w-2xl flex-col items-center gap-6 px-6 text-center opacity-0">
            <h2 id="configurator-teaser-title" className="headline-md">
              {t("title")}
            </h2>
            <p className="body-lg max-w-xl">{t("body")}</p>
            <Button href="/configurator" size="lg">
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
