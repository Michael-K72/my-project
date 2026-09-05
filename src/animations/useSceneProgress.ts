"use client";

import { useEffect, type RefObject } from "react";
import { ensureGsap, ScrollTrigger } from "./gsap";
import { renderState, setParticleMorph, type ParticleShapeId } from "@/three/state";

type Options = {
  start?: string;
  end?: string;
  /** Called with progress 0..1 on every scroll update (deterministic). */
  onProgress?: (progress: number) => void;
  /** Convenience: morph the particle universe between two shapes across this range. */
  morph?: { from: ParticleShapeId; to: ParticleShapeId };
  /** Optional camera z target reached at progress 1. */
  cameraZ?: { from: number; to: number };
  enabled?: boolean;
};

/**
 * Binds a DOM element's scroll range to deterministic progress callbacks.
 * Scrolling backwards reverses precisely because the value is a pure function
 * of scroll position.
 */
export function useSceneProgress<T extends HTMLElement>(ref: RefObject<T | null>, options: Options) {
  const { start = "top 85%", end = "top 15%", onProgress, morph, cameraZ, enabled = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    ensureGsap();

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => {
        const p = self.progress;
        if (morph) setParticleMorph(morph.from, morph.to, p);
        if (cameraZ) renderState.camera.z = cameraZ.from + (cameraZ.to - cameraZ.from) * p;
        onProgress?.(p);
      },
    });

    return () => trigger.kill();
    // Callers pass stable option objects; re-creating on every render would thrash triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, start, end, enabled, morph?.from, morph?.to, cameraZ?.from, cameraZ?.to]);
}
