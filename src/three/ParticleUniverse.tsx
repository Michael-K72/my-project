"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { identity } from "@/config/identity";
import { lerp } from "@/lib/utils";
import { particleFragment, particleVertex } from "./shaders/particles";
import { buildShapes, sampleTextPoints } from "./shapes";
import { renderState } from "./state";

type Props = {
  count: number;
};

/**
 * One draw call. All particles live in a single BufferGeometry; shape morphing,
 * turbulence, pointer physics and depth fading happen in the vertex shader.
 */
export function ParticleUniverse({ count }: Props) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const namePoints = sampleTextPoints(identity.nameLines, count);
    const shapes = buildShapes(count, namePoints);
    const geo = new THREE.BufferGeometry();
    // `position` is required by three; we feed shape 0 so bounding volumes are sane.
    geo.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    shapes.forEach((buffer, i) => geo.setAttribute(`aShape${i}`, new THREE.BufferAttribute(buffer, 3)));

    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uScale: { value: 1 },
      uSpin: { value: 1 },
      uTurbulence: { value: 0 },
      uDensity: { value: 1 },
      uSize: { value: 2.2 },
      uPixelRatio: { value: 1 },
      uMotion: { value: 1 },
      uOpacity: { value: 1 },
      uPointer: { value: new THREE.Vector3() },
      uPointerStrength: { value: 1 },
      uAccent: { value: new THREE.Color(0.75, 0.89, 1) },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    return () => geometry.dispose();
  }, [gl, geometry, uniforms]);

  // Smoothed copies so abrupt state writes (route changes) ease in.
  const smooth = useRef({ mix: 0, opacity: 0, scale: 1, spin: 1, turbulence: 0, from: 0, to: 0 });

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    const rs = renderState.particles;
    const s = smooth.current;
    const k = 1 - Math.exp(-delta * 6);

    // When the target pair changes, snap `from` to the currently visible blend
    // to avoid a jump: we approximate by carrying the eased mix.
    if (s.from !== rs.from || s.to !== rs.to) {
      s.from = rs.from;
      s.to = rs.to;
      s.mix = rs.mix;
    }
    s.mix = lerp(s.mix, rs.mix, k);
    s.opacity = lerp(s.opacity, rs.opacity, k);
    s.scale = lerp(s.scale, rs.scale, k);
    s.spin = lerp(s.spin, rs.spin, k);
    s.turbulence = lerp(s.turbulence, rs.turbulence, k);

    uniforms.uFrom.value = s.from;
    uniforms.uTo.value = s.to;
    uniforms.uMix.value = s.mix;
    uniforms.uOpacity.value = s.opacity;
    uniforms.uScale.value = s.scale;
    uniforms.uSpin.value = s.spin;
    uniforms.uTurbulence.value = s.turbulence;
    uniforms.uTime.value = state.clock.elapsedTime;

    const app = renderState.appearance;
    uniforms.uDensity.value = app.density;
    uniforms.uMotion.value = renderState.reducedMotion ? 0.15 : app.motion;
    uniforms.uAccent.value.setRGB(app.accent[0], app.accent[1], app.accent[2]);

    // Pointer → world position on the z=0 plane.
    const cam = state.camera as THREE.PerspectiveCamera;
    const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z;
    const halfW = halfH * cam.aspect;
    const p = renderState.pointer;
    uniforms.uPointer.value.set(p.x * halfW, p.y * halfH, 0);
    uniforms.uPointerStrength.value = lerp(uniforms.uPointerStrength.value, p.active && !renderState.reducedMotion ? 1 : 0, k);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
