"use client";

import { useEffect } from "react";
import { renderState, setParticleShape, type ParticleShapeId } from "@/three/state";

/**
 * Non-home routes call this to settle the particle universe into an ambient
 * shape and camera distance while the page is mounted.
 */
export function useAmbientShape(shape: ParticleShapeId, options?: { cameraZ?: number; opacity?: number; spin?: number; scale?: number }) {
  useEffect(() => {
    setParticleShape(shape);
    renderState.camera.z = options?.cameraZ ?? 10;
    renderState.particles.opacity = options?.opacity ?? 0.55;
    renderState.particles.spin = options?.spin ?? 0.6;
    renderState.particles.scale = options?.scale ?? 1;
    renderState.hero.visible = false;
    return () => {
      renderState.particles.opacity = 1;
      renderState.particles.spin = 1;
      renderState.particles.scale = 1;
    };
  }, [shape, options?.cameraZ, options?.opacity, options?.spin, options?.scale]);
}
