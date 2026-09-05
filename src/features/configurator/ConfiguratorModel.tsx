"use client";

import { useEffect, useRef } from "react";
import { featureLayer, type Configuration, type LayerKind } from "@/data/configurator";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/preferences";

const LAYER_ORDER: LayerKind[] = ["core", "shell", "orbit", "rings", "planes", "interface", "particles", "globe"];

function activeKinds(config: Configuration): LayerKind[] {
  const kinds = new Set<LayerKind>(["core"]);
  if (config.three !== "none") kinds.add("orbit");
  if (config.type === "ecommerce" || config.type === "saas") kinds.add("shell");
  config.features.forEach((f) => kinds.add(featureLayer[f]));
  if (config.languages.length > 1) kinds.add("planes");
  return LAYER_ORDER.filter((k) => kinds.has(k));
}

type Props = {
  config: Configuration;
  exploded: boolean;
};

/**
 * Abstract digital system. Layers are added as the visitor configures.
 * Pointer orbits the assembly; explode separates layers in Z.
 */
export function ConfiguratorModel({ config, exploded }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = usePreferences((s) => s.motion === "reduced");
  const kinds = activeKinds(config);
  const intensity = config.three === "cinematic" ? 1 : config.three === "immersive" ? 0.75 : config.three === "subtle" ? 0.4 : 0.15;

  useEffect(() => {
    const el = root.current;
    const s = stage.current;
    if (!el || !s || reduced) return;
    let raf = 0;
    let tx = 18;
    let ty = -22;
    let cx = 18;
    let cy = -22;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 36;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 28;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      s.style.transform = `rotateX(${58 + cy * 0.15}deg) rotateZ(${-28 + cx * 0.35}deg)`;
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const gap = exploded ? 46 : 16;

  return (
    <div ref={root} className="relative mx-auto aspect-square w-full max-w-[34rem] [perspective:1400px]" data-cursor="drag">
      <div
        ref={stage}
        className="absolute inset-[12%] [transform-style:preserve-3d] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)]"
        style={{ transform: "rotateX(58deg) rotateZ(-28deg)" }}
      >
        {kinds.map((kind, i) => (
          <Layer key={kind} kind={kind} index={i} gap={gap} intensity={intensity} languages={config.languages.length} />
        ))}
      </div>
      <span className="pointer-events-none absolute inset-x-[18%] bottom-[8%] h-16 rounded-[100%] bg-black/50 blur-2xl" />
    </div>
  );
}

function Layer({
  kind,
  index,
  gap,
  intensity,
  languages,
}: {
  kind: LayerKind;
  index: number;
  gap: number;
  intensity: number;
  languages: number;
}) {
  const z = index * gap;
  const base = "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 [transition-timing-function:var(--ease-out-expo)] [transform-style:preserve-3d]";

  if (kind === "core") {
    return (
      <div className={cn(base, "h-16 w-16")} style={{ transform: `translateZ(${z}px)` }}>
        <div className="h-full w-full rounded-full border border-pearl/40 bg-pearl/10 shadow-[0_0_40px_var(--accent-glow)]" />
      </div>
    );
  }
  if (kind === "shell") {
    return (
      <div className={cn(base, "h-44 w-56 rounded-md border border-pearl/30 bg-obsidian/70")} style={{ transform: `translateZ(${z}px)` }}>
        <span className="absolute left-4 top-4 h-1.5 w-16 rounded-full bg-pearl/70" />
        <span className="absolute left-4 top-9 h-1 w-10 rounded-full bg-pearl/30" />
        <span className="absolute bottom-4 right-4 h-6 w-14 rounded-full bg-accent/80" />
      </div>
    );
  }
  if (kind === "orbit") {
    return (
      <div className={cn(base, "h-64 w-64")} style={{ transform: `translateZ(${z}px) rotateX(70deg)` }}>
        <div className="h-full w-full rounded-full border border-accent/50 animate-orbit" style={{ animationDuration: `${18 - intensity * 8}s` }} />
        <div className="absolute inset-8 rounded-full border border-accent/20" />
      </div>
    );
  }
  if (kind === "rings") {
    return (
      <div className={cn(base, "h-52 w-52")} style={{ transform: `translateZ(${z}px)` }}>
        {[0, 1, 2].map((n) => (
          <span
            key={n}
            className="absolute inset-0 rounded-full border border-cyan/40"
            style={{ transform: `scale(${0.55 + n * 0.18}) rotateX(${60 + n * 8}deg)`, opacity: 0.4 + n * 0.15 }}
          />
        ))}
      </div>
    );
  }
  if (kind === "planes") {
    return (
      <div className={cn(base)} style={{ transform: `translateZ(${z}px)` }}>
        {Array.from({ length: Math.min(5, languages) }, (_, n) => (
          <span
            key={n}
            className="absolute left-1/2 top-1/2 h-24 w-36 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-pearl/25 bg-white/[0.03]"
            style={{ transform: `translateX(${(n - 1) * 18}px) translateZ(${n * 10}px)` }}
          />
        ))}
      </div>
    );
  }
  if (kind === "interface") {
    return (
      <div className={cn(base, "h-28 w-48 rounded-sm border border-ice/40 bg-graphite/80")} style={{ transform: `translateZ(${z}px)` }}>
        <span className="absolute left-3 top-3 grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }, (_, n) => (
            <span key={n} className="h-4 w-8 rounded-[2px] bg-white/10" />
          ))}
        </span>
      </div>
    );
  }
  if (kind === "particles") {
    return (
      <div className={cn(base, "h-40 w-40")} style={{ transform: `translateZ(${z}px)` }}>
        {Array.from({ length: 18 }, (_, n) => (
          <span
            key={n}
            className="absolute h-1 w-1 rounded-full bg-accent"
            style={{
              left: `${12 + ((n * 37) % 76)}%`,
              top: `${10 + ((n * 53) % 78)}%`,
              opacity: 0.35 + (n % 5) * 0.12,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className={cn(base, "h-36 w-36")} style={{ transform: `translateZ(${z}px)` }}>
      <div className="h-full w-full rounded-full border border-violet/50 bg-gradient-to-br from-navy/40 to-transparent" />
      <span className="absolute inset-[18%] rounded-full border border-violet/20" />
    </div>
  );
}
