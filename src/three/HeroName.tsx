"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { identity } from "@/config/identity";
import { seeded, smoothstep } from "@/lib/utils";
import { useUI } from "@/stores/ui";
import { gsap } from "@/animations/gsap";
import { materialPresets } from "./materials";
import { renderState } from "./state";

/** Path is isolated so the typeface can be swapped for a custom one later. */
export const HERO_FONT_URL = "/fonts/helvetiker_bold.typeface.json";

type Letter = {
  char: string;
  line: number;
  x: number;
  y: number;
  seed: [number, number, number];
  geometry: TextGeometry;
  edges: THREE.EdgesGeometry;
};

type FontGlyphData = { glyphs: Record<string, { ha: number }>; resolution: number };

function buildLetters(font: Font, size: number): Letter[] {
  const data = font.data as unknown as FontGlyphData;
  const unit = size / data.resolution;
  const advance = (ch: string) => (data.glyphs[ch]?.ha ?? data.glyphs["?"]?.ha ?? 600) * unit;
  const capHeight = size * 0.72;
  const gap = size * 0.28;
  const rand = seeded(7);
  const letters: Letter[] = [];

  identity.nameLines.forEach((line, lineIndex) => {
    const width = Array.from(line).reduce((w, ch) => w + advance(ch), 0);
    let x = -width / 2;
    const baseline = lineIndex === 0 ? gap / 2 : -gap / 2 - capHeight;
    for (const ch of line) {
      if (ch !== " ") {
        const geometry = new TextGeometry(ch, {
          font,
          size,
          depth: size * 0.22,
          curveSegments: 10,
          bevelEnabled: true,
          bevelThickness: size * 0.02,
          bevelSize: size * 0.014,
          bevelSegments: 5,
        });
        geometry.computeBoundingBox();
        letters.push({
          char: ch,
          line: lineIndex,
          x,
          y: baseline,
          seed: [rand(), rand(), rand()],
          geometry,
          edges: new THREE.EdgesGeometry(geometry, 28),
        });
      }
      x += advance(ch);
    }
  });
  return letters;
}

export function HeroName() {
  const font = useLoader(FontLoader, HERO_FONT_URL);
  const viewport = useThree((s) => s.viewport);
  const group = useRef<THREE.Group>(null);
  const letterRefs = useRef<Array<THREE.Group | null>>([]);
  const loaderDone = useUI((s) => s.loaderDone);

  // One shared material per role keeps state changes minimal (15 letters, 2 materials).
  const sharedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0 }), []);
  const sharedEdgeMaterial = useMemo(() => new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }), []);
  useEffect(
    () => () => {
      sharedMaterial.dispose();
      sharedEdgeMaterial.dispose();
    },
    [sharedMaterial, sharedEdgeMaterial],
  );
  const entrance = useRef({ value: 0 });

  // Responsive size: the longest line spans ~82% of the viewport width at z=0.
  const size = useMemo(() => {
    const data = font.data as unknown as FontGlyphData;
    const unit = 1 / data.resolution;
    const longest = Math.max(
      ...identity.nameLines.map((line) => Array.from(line).reduce((w, ch) => w + (data.glyphs[ch]?.ha ?? 600) * unit, 0)),
    );
    const target = (viewport.width * 0.82) / longest;
    return Math.min(1.55, Math.max(0.42, target));
  }, [font, viewport.width]);

  const letters = useMemo(() => buildLetters(font, size), [font, size]);

  useEffect(() => {
    return () => {
      letters.forEach((l) => {
        l.geometry.dispose();
        l.edges.dispose();
      });
    };
  }, [letters]);

  // Cinematic entrance once the loader releases the page.
  useEffect(() => {
    if (!loaderDone) return;
    const tween = gsap.to(entrance.current, {
      value: 1,
      duration: renderState.reducedMotion ? 0.6 : 2.6,
      ease: "expo.out",
      delay: renderState.reducedMotion ? 0 : 0.35,
    });
    return () => {
      tween.kill();
    };
  }, [loaderDone]);

  useFrame((state) => {
    const g = group.current;
    const mat = sharedMaterial;
    const edgeMat = sharedEdgeMaterial;
    if (!g) return;

    const visible = renderState.hero.visible;
    g.visible = visible && entrance.current.value > 0.001;
    if (!g.visible) return;

    const t = state.clock.elapsedTime;
    const p = renderState.hero.progress;
    const e = entrance.current.value;
    const pointer = renderState.pointer;
    const motion = renderState.reducedMotion ? 0 : renderState.appearance.motion;

    // Whole-sculpture idle: extremely slow yaw, a breath of pitch from the pointer.
    g.rotation.y = Math.sin(t * 0.12) * 0.05 * motion + pointer.x * 0.05 * motion;
    g.rotation.x = -pointer.y * 0.035 * motion;
    g.position.z = p * 2.2;

    // Material follows the appearance builder.
    const preset = materialPresets[renderState.appearance.material];
    mat.metalness = preset.metalness;
    mat.roughness = preset.roughness + p * 0.25;
    mat.clearcoat = preset.clearcoat;
    mat.clearcoatRoughness = preset.clearcoatRoughness;
    mat.transmission = preset.transmission;
    mat.thickness = preset.thickness;
    mat.ior = preset.ior;
    mat.envMapIntensity = preset.envMapIntensity * renderState.appearance.lighting;
    mat.color.set(preset.color);
    const fade = 1 - smoothstep((p - 0.5) / 0.45);
    mat.opacity = e * fade;
    mat.transparent = true;

    // Internal structure reveals mid-disassembly, then dissolves.
    const edgeReveal = smoothstep((p - 0.12) / 0.35) * (1 - smoothstep((p - 0.7) / 0.3));
    edgeMat.opacity = edgeReveal * 0.55;
    edgeMat.color.setRGB(renderState.appearance.accent[0], renderState.appearance.accent[1], renderState.appearance.accent[2]);

    letters.forEach((letter, i) => {
      const node = letterRefs.current[i];
      if (!node) return;
      const [s1, s2, s3] = letter.seed;
      const enterZ = -(5 + s1 * 5) * (1 - e);
      const enterY = (s2 - 0.5) * 1.5 * (1 - e);
      node.position.set(
        letter.x + (s1 - 0.5) * 3.2 * p,
        letter.y + enterY + (s2 - 0.5) * 2.2 * p,
        enterZ + p * (1.5 + s3 * 6.5) + Math.sin(t * 0.5 + s3 * 6.28) * 0.012 * motion,
      );
      node.rotation.set((s2 - 0.5) * 1.1 * p, (s1 - 0.5) * 1.6 * p + (1 - e) * (s3 - 0.5) * 0.8, (s3 - 0.5) * 0.4 * p);
    });
  });

  return (
    <group ref={group} visible={false}>
      {letters.map((letter, i) => (
        <group
          key={`${letter.line}-${i}`}
          ref={(el) => {
            letterRefs.current[i] = el;
          }}
        >
          <mesh geometry={letter.geometry} material={sharedMaterial} />
          <lineSegments geometry={letter.edges} material={sharedEdgeMaterial} position={[0, 0, size * 0.005]} />
        </group>
      ))}
    </group>
  );
}
