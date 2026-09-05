"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Fully procedural studio lighting – no HDR downloads. A cool key light, a
 * warm silver fill, a violet kicker and a large soft ceiling produce the
 * "expensive chrome" reflections on the letters.
 */
export function StudioEnvironment({ intensity = 1 }: { intensity?: number }) {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <group rotation={[-Math.PI / 4, -0.3, 0]}>
        <Lightformer form="rect" intensity={6 * intensity} color="#dfe9f5" position={[0, 6, -6]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={3.2 * intensity} color="#bfe3ff" position={[-8, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2.4 * intensity} color="#e8e2d6" position={[8, -1, 3]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 1.6, 1]} />
        <Lightformer form="ring" intensity={1.8 * intensity} color="#9b8cff" position={[3, -6, -4]} scale={[4, 4, 1]} />
        <Lightformer form="circle" intensity={9 * intensity} color="#ffffff" position={[0, 2, 8]} scale={[1.2, 1.2, 1]} />
      </group>
    </Environment>
  );
}
