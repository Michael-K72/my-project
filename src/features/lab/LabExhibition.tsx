"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TechLabel } from "@/components/ui/TechLabel";
import { experiments, type ExperimentId } from "@/data/lab";
import { cn } from "@/lib/utils";
import { accentPalette, useAppearance } from "@/stores/appearance";

function LiquidChrome() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.7, 0.22, 128, 24]} />
      <meshPhysicalMaterial metalness={1} roughness={0.12} color="#d9dde3" envMapIntensity={1.4} />
    </mesh>
  );
}

function LightingObject() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!light.current) return;
    light.current.position.set(Math.sin(state.clock.elapsedTime) * 1.4, Math.cos(state.clock.elapsedTime * 0.7) * 0.8, 1.2);
  });
  return (
    <>
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#ece9e2" metalness={0.7} roughness={0.25} />
      </mesh>
      <pointLight ref={light} intensity={18} color="#bfe3ff" />
    </>
  );
}

function GlassObject() {
  return (
    <mesh>
      <sphereGeometry args={[0.95, 48, 48]} />
      <meshPhysicalMaterial transmission={0.92} thickness={1.2} roughness={0.06} ior={1.5} color="#bfe3ff" metalness={0.05} />
    </mesh>
  );
}

function ExhibitCanvas({ children }: { children: React.ReactNode }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} className="h-full w-full">
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={1.2} />
      {children}
    </Canvas>
  );
}

function MagneticField() {
  const items = ["01", "02", "03", "04"];
  const root = useRef<HTMLDivElement>(null);
  const onMove = (e: ReactPointerEvent) => {
    const el = root.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>("[data-mag]").forEach((node) => {
      const r = node.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(40, Math.hypot(dx, dy));
      node.style.transform = `translate(${(dx / d) * 18}px, ${(dy / d) * 18}px)`;
    });
  };
  return (
    <div ref={root} onPointerMove={onMove} onPointerLeave={() => root.current?.querySelectorAll<HTMLElement>("[data-mag]").forEach((n) => (n.style.transform = ""))} className="flex h-full items-center justify-center gap-6">
      {items.map((n) => (
        <span key={n} data-mag className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line-strong)] font-mono text-sm transition-transform duration-500">
          {n}
        </span>
      ))}
    </div>
  );
}

function TypeDistortion() {
  const [x, setX] = useState(0);
  return (
    <button
      type="button"
      className="flex h-full w-full items-center justify-center"
      onPointerMove={(e) => setX((e.clientX / window.innerWidth - 0.5) * 180)}
    >
      <span className="headline-lg" style={{ letterSpacing: `${x * 0.02}em`, transform: `skewX(${x * 0.04}deg)` }}>
        KALACHIN
      </span>
    </button>
  );
}

function DataChart() {
  const values = [12, 28, 22, 40, 36, 58, 51, 72, 68, 90];
  const d = values.map((v, i) => `${(i / (values.length - 1)) * 220},${80 - v * 0.7}`).join(" ");
  return (
    <svg viewBox="0 0 240 90" className="h-full w-full p-6">
      <polyline points={d} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1)) * 220} cy={80 - v * 0.7} r="2.2" fill="var(--accent)" />
      ))}
    </svg>
  );
}

function DragCards() {
  const [cards, setCards] = useState([0, 1, 2]);
  return (
    <div className="relative h-full">
      {cards.map((n, i) => (
        <article
          key={n}
          draggable
          onDragEnd={() => setCards((c) => [...c.filter((x) => x !== n), n])}
          className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-lg border border-[var(--line-strong)] bg-graphite/80 p-4"
          style={{ transform: `translate(-50%, -50%) translate(${i * 14}px, ${i * 10}px) rotate(${i * 3}deg)` }}
        >
          <span className="tech-label-sm">0{n + 1}</span>
          <p className="mt-2 text-sm">Layer {n + 1}</p>
        </article>
      ))}
    </div>
  );
}

function ColorSystem() {
  const accent = useAppearance((s) => s.accent);
  const set = useAppearance((s) => s.set);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="h-20 w-20 rounded-full border border-[var(--line-strong)]" style={{ background: accentPalette[accent].hex }} />
      <div className="flex gap-2">
        {(Object.keys(accentPalette) as Array<keyof typeof accentPalette>).map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key}
            onClick={() => set({ accent: key })}
            className={cn("h-8 w-8 rounded-full border", accent === key ? "border-pearl" : "border-transparent")}
            style={{ background: accentPalette[key].hex }}
          />
        ))}
      </div>
    </div>
  );
}

function ParticleField() {
  return (
    <div className="relative h-full overflow-hidden">
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-accent animate-pulse-soft"
          style={{ left: `${(i * 17) % 100}%`, top: `${(i * 29) % 100}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

function Exhibit({ id }: { id: ExperimentId }) {
  if (id === "shader") return <ExhibitCanvas><LiquidChrome /></ExhibitCanvas>;
  if (id === "lighting") return <ExhibitCanvas><LightingObject /></ExhibitCanvas>;
  if (id === "glass") return <ExhibitCanvas><GlassObject /></ExhibitCanvas>;
  if (id === "magnetic") return <MagneticField />;
  if (id === "typography") return <TypeDistortion />;
  if (id === "data") return <DataChart />;
  if (id === "cards") return <DragCards />;
  if (id === "color") return <ColorSystem />;
  return <ParticleField />;
}

export function LabExhibition() {
  const t = useTranslations("lab");
  const [active, setActive] = useState<ExperimentId>("particles");

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <ul className="space-y-1">
        {experiments.map((exp) => (
          <li key={exp.id}>
            <button
              type="button"
              onClick={() => setActive(exp.id)}
              className={cn(
                "w-full rounded-lg px-3 py-3 text-left transition-colors",
                active === exp.id ? "bg-white/[0.06] text-pearl" : "text-mist hover:text-pearl",
              )}
            >
              <TechLabel index={exp.index}>{t(`experiments.${exp.id}.title`)}</TechLabel>
              <span className="mt-1 block text-[0.75rem] text-ash">{exp.tech}</span>
            </button>
          </li>
        ))}
      </ul>
      <article className="panel overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div>
            <TechLabel>{t("exhibit")}</TechLabel>
            <h2 className="mt-2 text-2xl font-medium tracking-tight">{t(`experiments.${active}.title`)}</h2>
          </div>
        </div>
        <div className="aspect-[16/10] bg-obsidian/40">
          <Exhibit id={active} />
        </div>
        <p className="body-lg p-6">{t(`experiments.${active}.body`)}</p>
      </article>
    </div>
  );
}
