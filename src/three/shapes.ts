import { seeded } from "@/lib/utils";
import { ParticleShape } from "./state";

export const SHAPE_COUNT = 8;

type ShapeBuffers = Float32Array[];

const TAU = Math.PI * 2;

/**
 * Builds one Float32Array (xyz per particle) for every shape in ParticleShape.
 * All shapes share the same particle count so the shader can morph 1:1.
 */
export function buildShapes(count: number, namePoints: Float32Array | null): ShapeBuffers {
  const rand = seeded(1337);
  const buffers: ShapeBuffers = Array.from({ length: SHAPE_COUNT }, () => new Float32Array(count * 3));

  const set = (shape: number, i: number, x: number, y: number, z: number) => {
    const b = buffers[shape];
    b[i * 3] = x;
    b[i * 3 + 1] = y;
    b[i * 3 + 2] = z;
  };

  for (let i = 0; i < count; i++) {
    const u = rand();
    const v = rand();
    const w = rand();
    const t = i / count;

    // CHAOS – gaussian-ish cloud, denser toward the centre, large radius.
    {
      const r = 7.5 * Math.cbrt(u) * (0.35 + 0.65 * w);
      const theta = TAU * v;
      const phi = Math.acos(2 * w - 1);
      set(ParticleShape.CHAOS, i, r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.7, r * Math.cos(phi));
    }

    // ORBITS – three tilted elliptical rings with thickness.
    {
      const ring = i % 3;
      const a = TAU * u;
      const rx = 3.4 + ring * 0.35;
      const ry = 2.1 + ring * 0.25;
      const thick = (v - 0.5) * 0.18;
      let x = Math.cos(a) * rx + thick;
      let y = Math.sin(a) * ry + thick;
      let z = (w - 0.5) * 0.12;
      const tilt = ring * 1.05 + 0.3;
      const cy = Math.cos(tilt);
      const sy = Math.sin(tilt);
      // rotate about X then Y for spatial variety
      const y2 = y * cy - z * sy;
      const z2 = y * sy + z * cy;
      y = y2;
      z = z2;
      const rot = ring * 0.8;
      const x3 = x * Math.cos(rot) - z * Math.sin(rot);
      const z3 = x * Math.sin(rot) + z * Math.cos(rot);
      x = x3;
      z = z3;
      set(ParticleShape.ORBITS, i, x, y, z);
    }

    // SPIRAL – two-arm logarithmic spiral.
    {
      const arm = i % 2;
      const r = 0.4 + 3.8 * Math.sqrt(u);
      const a = r * 1.9 + arm * Math.PI + (v - 0.5) * 0.6 * (1 - u * 0.6);
      set(ParticleShape.SPIRAL, i, Math.cos(a) * r, Math.sin(a) * r * 0.62, (w - 0.5) * 0.5 * (1 - u));
    }

    // WAVE – a field of standing waves seen from a low angle.
    {
      const x = (u - 0.5) * 13;
      const z = (v - 0.5) * 8;
      const y = Math.sin(x * 0.9) * 0.35 + Math.cos(z * 1.3 + x * 0.4) * 0.3 - 1.2;
      set(ParticleShape.WAVE, i, x, y + (w - 0.5) * 0.08, z);
    }

    // LATTICE – four stacked interface planes; edges denser than interiors.
    {
      const plane = i % 4;
      const z = -1.8 + plane * 1.2;
      const edge = w < 0.55;
      let x: number;
      let y: number;
      if (edge) {
        const side = Math.floor(u * 4);
        const along = v;
        const hw = 2.9;
        const hh = 1.75;
        x = side === 0 || side === 2 ? -hw + along * hw * 2 : side === 1 ? hw : -hw;
        y = side === 1 || side === 3 ? -hh + along * hh * 2 : side === 0 ? hh : -hh;
      } else {
        // interior grid points snapped to a coarse grid
        x = (Math.round((u - 0.5) * 12) / 12) * 5.6;
        y = (Math.round((v - 0.5) * 8) / 8) * 3.3;
      }
      set(ParticleShape.LATTICE, i, x + plane * 0.18, y - plane * 0.12, z);
    }

    // GLOBE – fibonacci sphere plus latitude/longitude guide rings.
    {
      const R = 2.7;
      if (i % 6 === 0) {
        const isLat = i % 2 === 0;
        const idx = Math.floor(u * 6);
        const a = TAU * v;
        if (isLat) {
          const lat = -1.2 + idx * 0.48;
          const rr = Math.cos(lat) * R;
          set(ParticleShape.GLOBE, i, Math.cos(a) * rr, Math.sin(lat) * R, Math.sin(a) * rr);
        } else {
          const lng = idx * (Math.PI / 6);
          set(ParticleShape.GLOBE, i, Math.cos(a) * R * Math.cos(lng), Math.sin(a) * R, Math.cos(a) * R * Math.sin(lng));
        }
      } else {
        const k = i + 0.5;
        const phi = Math.acos(1 - (2 * k) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;
        // soft continent-like density: pull some points slightly inward so the surface reads as land/sea
        const land = Math.sin(phi * 3.1 + theta * 0.7) * Math.cos(theta * 1.3) > 0.15;
        const rr = land ? R : R * 0.985;
        set(ParticleShape.GLOBE, i, rr * Math.sin(phi) * Math.cos(theta), rr * Math.cos(phi), rr * Math.sin(phi) * Math.sin(theta));
      }
    }

    // NAME – sampled from the typographic mask; fall back to orbits.
    {
      if (namePoints && namePoints.length >= count * 3) {
        set(ParticleShape.NAME, i, namePoints[i * 3], namePoints[i * 3 + 1], namePoints[i * 3 + 2]);
      } else {
        const b = buffers[ParticleShape.ORBITS];
        set(ParticleShape.NAME, i, b[i * 3], b[i * 3 + 1], b[i * 3 + 2]);
      }
    }

    // RINGS – concentric calendar orbit; outer rings denser.
    {
      const ring = Math.min(6, Math.floor(Math.sqrt(t) * 7));
      const r = 0.9 + ring * 0.42;
      const a = TAU * u;
      set(ParticleShape.RINGS, i, Math.cos(a) * r, Math.sin(a) * r, (v - 0.5) * 0.05 + ring * 0.02);
    }
  }

  return buffers;
}

/**
 * Rasterises two lines of text into a canvas and samples `count` points from
 * the glyph area. Runs on the client only.
 */
export function sampleTextPoints(lines: readonly string[], count: number, worldWidth = 7.6): Float32Array | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const W = 1200;
  const H = 640;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = 250;
  ctx.font = `700 ${fontSize}px "Geist", "Inter", "Helvetica Neue", Arial, sans-serif`;
  const lineHeight = fontSize * 0.98;
  const totalHeight = lineHeight * lines.length;
  lines.forEach((line, idx) => {
    // Ensure the longest line fits within the canvas width.
    const measured = ctx.measureText(line).width;
    const scale = Math.min(1, (W * 0.92) / measured);
    ctx.save();
    ctx.translate(W / 2, H / 2 - totalHeight / 2 + lineHeight * (idx + 0.5));
    ctx.scale(scale, 1);
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });

  const data = ctx.getImageData(0, 0, W, H).data;
  const candidates: number[] = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4] > 128) candidates.push(x, y);
    }
  }
  if (candidates.length < 6) return null;

  const rand = seeded(42);
  const out = new Float32Array(count * 3);
  const scale = worldWidth / W;
  const n = candidates.length / 2;
  for (let i = 0; i < count; i++) {
    const c = Math.floor(rand() * n);
    const x = candidates[c * 2] + (rand() - 0.5) * 2;
    const y = candidates[c * 2 + 1] + (rand() - 0.5) * 2;
    out[i * 3] = (x - W / 2) * scale;
    out[i * 3 + 1] = -(y - H / 2) * scale;
    out[i * 3 + 2] = (rand() - 0.5) * 0.25;
  }
  return out;
}
