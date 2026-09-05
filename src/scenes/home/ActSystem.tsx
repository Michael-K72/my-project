"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useSceneProgress } from "@/animations/useSceneProgress";
import { Callout, TechLabel } from "@/components/ui/TechLabel";
import { clamp, cn, range, smoothstep } from "@/lib/utils";
import { ParticleShape } from "@/three/state";

const LAYERS = [
  { id: "background", z: -220, label: "BACKGROUND" },
  { id: "wire", z: -140, label: "WIREFRAME" },
  { id: "structure", z: -60, label: "STRUCTURE" },
  { id: "interface", z: 20, label: "INTERFACE" },
  { id: "components", z: 110, label: "COMPONENTS" },
] as const;

/**
 * Act III. A digital system assembles while the visual stays pinned for 350vh.
 * Stages: point → particles → wireframe → structure → interface → components →
 * ecosystem. Layers separate in Z mid-way (exploded view) and re-connect.
 */
export function ActSystem() {
  const t = useTranslations("home.system");
  const stages = t.raw("stages") as string[];
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const numeral = useRef<HTMLSpanElement>(null);
  const stageList = useRef<HTMLOListElement>(null);
  const point = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);

  useSceneProgress(ref, {
    start: "top top",
    end: "bottom bottom",
    morph: { from: ParticleShape.SPIRAL, to: ParticleShape.LATTICE },
    cameraZ: { from: 9.5, to: 8.2 },
    onProgress: (p) => {
      // Stage index 0..6 across progress.
      const idx = clamp(Math.floor(p * stages.length), 0, stages.length - 1);
      if (numeral.current) numeral.current.textContent = String(idx + 1).padStart(2, "0");
      const items = stageList.current?.children;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          (items[i] as HTMLElement).dataset.active = String(i === idx);
          (items[i] as HTMLElement).dataset.done = String(i < idx);
        }
      }

      // Point (0–12%) grows then hands over to the layered system.
      const pointPhase = 1 - smoothstep(range(p, 0.08, 0.18));
      if (point.current) {
        point.current.style.opacity = String(pointPhase);
        point.current.style.transform = `translate(-50%, -50%) scale(${0.4 + smoothstep(range(p, 0, 0.12)) * 1.6})`;
      }

      // Layers appear sequentially, explode between 45–70%, reassemble by 90%.
      const explode = smoothstep(range(p, 0.42, 0.62)) * (1 - smoothstep(range(p, 0.74, 0.92)));
      const rotY = -18 + smoothstep(range(p, 0.15, 0.9)) * 30;
      const rotX = 12 - smoothstep(range(p, 0.15, 0.9)) * 6;
      if (stage.current) {
        stage.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        stage.current.style.opacity = String(smoothstep(range(p, 0.1, 0.2)));
      }
      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        const appear = smoothstep(range(p, 0.14 + i * 0.075, 0.24 + i * 0.075));
        const z = layer.z * (0.25 + explode * 0.75);
        el.style.opacity = String(appear);
        el.style.transform = `translate3d(0,0,${z}px) scale(${0.92 + appear * 0.08})`;
      });
      if (caption.current) caption.current.style.opacity = String(smoothstep(range(p, 0.86, 0.96)));
    },
  });

  return (
    <section ref={ref} className="relative h-[350svh]" data-layer="content" aria-labelledby="system-title">
      <div className="sticky top-0 flex h-[100svh] flex-col px-[var(--gutter)] pb-10 pt-28">
        <div className="flex items-start justify-between">
          <Callout>{t("label")}</Callout>
          <TechLabel className="hidden md:inline-flex">SYS · 03</TechLabel>
        </div>

        <div className="relative grid flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_2fr_1fr]">
          {/* Stage list */}
          <ol ref={stageList} className="order-2 flex flex-wrap gap-x-4 gap-y-2 lg:order-1 lg:flex-col lg:gap-3">
            {stages.map((s, i) => (
              <li
                key={s}
                data-active="false"
                data-done="false"
                className="group flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ash transition-colors duration-500 data-[active=true]:text-pearl data-[done=true]:text-mist"
              >
                <span className="h-px w-4 bg-current opacity-40 transition-all duration-500 group-data-[active=true]:w-8 group-data-[active=true]:bg-accent group-data-[active=true]:opacity-100" />
                <span className="w-5">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>

          {/* Assembly stage */}
          <div className="order-1 relative mx-auto aspect-[4/3] w-full max-w-[560px] lg:order-2 [perspective:1400px]">
            <div
              ref={point}
              className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-pearl shadow-[0_0_30px_var(--accent-glow),0_0_80px_var(--accent-glow)]"
              style={{ transform: "translate(-50%,-50%) scale(0.4)" }}
            />
            <div ref={stage} className="absolute inset-0 opacity-0 [transform-style:preserve-3d]">
              {LAYERS.map((layer, i) => (
                <div
                  key={layer.id}
                  ref={(el) => {
                    layerRefs.current[i] = el;
                  }}
                  className="absolute inset-[6%] opacity-0 [transform-style:preserve-3d]"
                >
                  <LayerVisual id={layer.id} />
                  <span className="tech-label-sm absolute -right-2 top-0 translate-x-full whitespace-nowrap pl-3 before:absolute before:left-0 before:top-1/2 before:h-px before:w-2 before:bg-[var(--line-strong)]">
                    {layer.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Numeral */}
          <div className="order-3 flex flex-col items-end gap-4">
            <span ref={numeral} className="numeral text-[clamp(4rem,10vw,9rem)] font-medium leading-none text-pearl/90">
              01
            </span>
            <h2 id="system-title" className="headline-md max-w-xs text-right">
              {t("title")}
            </h2>
          </div>
        </div>

        <p ref={caption} className="body-lg mx-auto max-w-2xl text-center opacity-0">
          {t("caption")}
        </p>
      </div>
    </section>
  );
}

/** Abstract, procedural visuals for each system layer. */
function LayerVisual({ id }: { id: (typeof LAYERS)[number]["id"] }) {
  switch (id) {
    case "background":
      return <div className="h-full w-full rounded-sm bg-[radial-gradient(ellipse_at_40%_40%,rgba(191,227,255,0.10),rgba(5,6,9,0.6)_70%)] border border-[var(--line)]" />;
    case "wire":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full text-pearl/60" fill="none" stroke="currentColor" strokeWidth="0.75">
          <rect x="0.5" y="0.5" width="399" height="299" />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`v${i}`} x1={50 * (i + 1)} y1="0" x2={50 * (i + 1)} y2="300" opacity="0.35" />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={50 * (i + 1)} x2="400" y2={50 * (i + 1)} opacity="0.35" />
          ))}
          <line x1="0" y1="0" x2="400" y2="300" opacity="0.25" />
          <line x1="400" y1="0" x2="0" y2="300" opacity="0.25" />
        </svg>
      );
    case "structure":
      return (
        <div className="grid h-full w-full grid-cols-12 grid-rows-6 gap-2 p-3">
          <div className="col-span-12 row-span-1 rounded-sm border border-[var(--line-strong)]" />
          <div className="col-span-4 row-span-5 rounded-sm border border-[var(--line-strong)]" />
          <div className="col-span-8 row-span-3 rounded-sm border border-[var(--line-strong)]" />
          <div className="col-span-8 row-span-2 rounded-sm border border-[var(--line-strong)]" />
        </div>
      );
    case "interface":
      return (
        <div className="glass h-full w-full rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="h-2 w-16 rounded-full bg-pearl/70" />
            <span className="h-2 w-8 rounded-full bg-accent/70" />
          </div>
          <div className="mt-6 space-y-2">
            <span className="block h-5 w-3/4 rounded-sm bg-pearl/80" />
            <span className="block h-5 w-1/2 rounded-sm bg-pearl/40" />
          </div>
          <div className="mt-6 flex gap-2">
            <span className="h-7 w-24 rounded-full bg-pearl" />
            <span className="h-7 w-24 rounded-full border border-[var(--line-strong)]" />
          </div>
        </div>
      );
    case "components":
      return (
        <div className="relative h-full w-full">
          {[
            ["8%", "12%", "28%", "18%"],
            ["60%", "8%", "30%", "26%"],
            ["12%", "58%", "36%", "24%"],
            ["58%", "56%", "30%", "30%"],
          ].map(([l, tp, w, h], i) => (
            <div
              key={i}
              className={cn("absolute rounded-md border border-[var(--line-strong)] bg-graphite/80 p-2", i === 1 && "border-accent/50")}
              style={{ left: l, top: tp, width: w, height: h }}
            >
              <span className="block h-1.5 w-1/2 rounded-full bg-pearl/60" />
              <span className="mt-1.5 block h-1.5 w-1/3 rounded-full bg-pearl/30" />
            </div>
          ))}
        </div>
      );
  }
}
