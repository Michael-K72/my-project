/**
 * Mutable render state shared between scroll/interaction code and the WebGL
 * frame loop. It is intentionally NOT reactive: scroll handlers write, the
 * `useFrame` loop reads. This avoids React re-renders at 60–120 Hz.
 */
export const ParticleShape = {
  CHAOS: 0,
  ORBITS: 1,
  SPIRAL: 2,
  WAVE: 3,
  LATTICE: 4,
  GLOBE: 5,
  NAME: 6,
  RINGS: 7,
} as const;

export type ParticleShapeId = (typeof ParticleShape)[keyof typeof ParticleShape];

export type RenderState = {
  /** Document scroll progress 0..1. */
  scroll: number;
  /** Smoothed scroll velocity (px/frame), used for motion blur-like stretch. */
  velocity: number;
  /** Normalised pointer, -1..1 on both axes; y up. */
  pointer: { x: number; y: number; active: boolean };
  particles: {
    from: ParticleShapeId;
    to: ParticleShapeId;
    /** 0 = fully `from`, 1 = fully `to`. */
    mix: number;
    opacity: number;
    scale: number;
    /** Multiplier for idle rotation speed. */
    spin: number;
    /** Extra turbulence used by the 404 page / transitions. */
    turbulence: number;
  };
  hero: {
    /** 0 = assembled sculpture, 1 = fully disassembled. */
    progress: number;
    visible: boolean;
  };
  camera: {
    z: number;
    /** Multiplier for pointer-driven camera drift. */
    drift: number;
  };
  /** Set by the appearance builder; consumed by materials. */
  appearance: {
    accent: [number, number, number];
    density: number;
    lighting: number;
    material: "chrome" | "titanium" | "glass" | "obsidian";
    motion: number;
  };
  reducedMotion: boolean;
};

export const renderState: RenderState = {
  scroll: 0,
  velocity: 0,
  pointer: { x: 0, y: 0, active: false },
  particles: {
    from: ParticleShape.CHAOS,
    to: ParticleShape.CHAOS,
    mix: 0,
    opacity: 1,
    scale: 1,
    spin: 1,
    turbulence: 0,
  },
  hero: { progress: 0, visible: false },
  camera: { z: 9, drift: 1 },
  appearance: {
    accent: [0.75, 0.89, 1],
    density: 1,
    lighting: 1,
    material: "chrome",
    motion: 1,
  },
  reducedMotion: false,
};

/** Sets a morph between two shapes. `mix` is typically a scroll progress. */
export function setParticleMorph(from: ParticleShapeId, to: ParticleShapeId, mix: number) {
  renderState.particles.from = from;
  renderState.particles.to = to;
  renderState.particles.mix = mix;
}

/** Snaps the universe to a single ambient shape (used by non-home routes). */
export function setParticleShape(shape: ParticleShapeId) {
  renderState.particles.from = shape;
  renderState.particles.to = shape;
  renderState.particles.mix = 1;
}

export function hexToRgb01(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
