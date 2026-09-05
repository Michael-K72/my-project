"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { clientFeatures } from "@/config/features";
import { lerp } from "@/lib/utils";
import { accentPalette, useAppearance } from "@/stores/appearance";
import { usePreferences, type QualityTier } from "@/stores/preferences";
import { HeroName } from "./HeroName";
import { ParticleUniverse } from "./ParticleUniverse";
import { hexToRgb01, renderState } from "./state";
import { StudioEnvironment } from "./StudioEnvironment";

const PARTICLES: Record<QualityTier, number> = { high: 26000, medium: 13000, low: 6000 };

/** Heuristic quality tier. Engineering optimisations come first; this only trims on weak devices. */
function detectQuality(): QualityTier {
  if (typeof window === "undefined") return "high";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mobile = window.matchMedia("(pointer: coarse)").matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (mobile && (cores <= 4 || memory <= 4)) return "low";
  if (mobile || cores <= 4) return "medium";
  return "high";
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 3.5);
    const motion = renderState.reducedMotion ? 0 : renderState.appearance.motion * renderState.camera.drift;
    const targetX = renderState.pointer.x * 0.28 * motion;
    const targetY = renderState.pointer.y * 0.18 * motion;
    camera.position.x = lerp(camera.position.x, targetX, k);
    camera.position.y = lerp(camera.position.y, targetY, k);
    camera.position.z = lerp(camera.position.z, renderState.camera.z, k);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Bridges reactive stores into the mutable render state once per change. */
function StateBridge() {
  const motion = usePreferences((s) => s.motion);
  const appearance = useAppearance();
  useEffect(() => {
    renderState.reducedMotion = motion === "reduced";
  }, [motion]);
  useEffect(() => {
    renderState.appearance.accent = hexToRgb01(accentPalette[appearance.accent].hex);
    renderState.appearance.density = appearance.density;
    renderState.appearance.lighting = appearance.lighting;
    renderState.appearance.material = appearance.material;
    renderState.appearance.motion = appearance.motionIntensity;
  }, [appearance.accent, appearance.density, appearance.lighting, appearance.material, appearance.motionIntensity]);
  return null;
}

function usePointerTracking() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      renderState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      renderState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      renderState.pointer.active = true;
    };
    const onLeave = () => {
      renderState.pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);
}

/**
 * The single persistent WebGL layer behind every route. Fixed, non-interactive,
 * one render loop. Content is layered above it in the DOM.
 */
export function GlobalCanvas() {
  const [quality, setQuality] = useState<QualityTier>("high");
  const [dpr, setDpr] = useState(1.5);
  const setQualityPref = usePreferences((s) => s.setQuality);
  usePointerTracking();

  useEffect(() => {
    const q = detectQuality();
    setQuality(q);
    setQualityPref(q);
    setDpr(q === "high" ? Math.min(window.devicePixelRatio, 1.75) : q === "medium" ? 1.25 : 1);
  }, [setQualityPref]);

  const count = useMemo(() => PARTICLES[quality], [quality]);
  const bloom = clientFeatures.bloom && quality !== "low";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" data-layer="three">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 9], fov: 42, near: 0.1, far: 60 }}
        gl={{
          antialias: !bloom,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        frameloop="always"
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(0.9, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(quality === "high" ? 1.75 : 1.25, d + 0.25))}
        />
        <StateBridge />
        <CameraRig />
        <ParticleUniverse count={count} />
        <Suspense fallback={null}>
          <StudioEnvironment />
          <HeroName />
        </Suspense>
        {bloom && (
          <EffectComposer multisampling={quality === "high" ? 4 : 0}>
            <Bloom intensity={0.55} luminanceThreshold={0.72} luminanceSmoothing={0.2} mipmapBlur radius={0.6} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
