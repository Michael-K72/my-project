"use client";

import type { ReactNode } from "react";
import { useAmbientShape } from "@/animations/useAmbientShape";
import { Footer } from "@/components/layout/Footer";
import type { ParticleShapeId } from "@/three/state";

type Props = {
  children: ReactNode;
  shape: ParticleShapeId;
  cameraZ?: number;
  opacity?: number;
  spin?: number;
  scale?: number;
  footerFrom?: ParticleShapeId;
  className?: string;
};

/** Shared route chrome: settles the particle universe and ends with the cinematic footer. */
export function PageFrame({ children, shape, cameraZ, opacity, spin, scale, footerFrom, className }: Props) {
  useAmbientShape(shape, { cameraZ, opacity, spin, scale });
  return (
    <main id="main" className={className}>
      {children}
      <Footer from={footerFrom ?? shape} />
    </main>
  );
}
