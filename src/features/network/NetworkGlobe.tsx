"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TechLabel } from "@/components/ui/TechLabel";
import { regions, type RegionId } from "@/data/network";
import { cn } from "@/lib/utils";

function latLngToVec(lat: number, lng: number, r = 1.6) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(-(r * Math.sin(phi) * Math.cos(theta)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function GlobeMesh({ selected }: { selected: RegionId }) {
  const group = useRef<THREE.Group>(null);
  const region = regions.find((r) => r.id === selected) ?? regions[0];
  const points = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 2400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 1.6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.08;
  });

  const marker = latLngToVec(region.lat, region.lng);

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.58, 48, 48]} />
        <meshBasicMaterial color="#0b1020" transparent opacity={0.55} />
      </mesh>
      <points geometry={points}>
        <pointsMaterial color="#bfe3ff" size={0.018} sizeAttenuation transparent opacity={0.85} />
      </points>
      <mesh position={marker}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ece9e2" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.62, 0.004, 8, 80]} />
        <meshBasicMaterial color="#7fd3ff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export function NetworkGlobe() {
  const t = useTranslations("network");
  const [selected, setSelected] = useState<RegionId>("zurich");

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="relative aspect-square w-full max-w-xl">
        <Canvas camera={{ position: [0, 0.2, 4.2], fov: 40 }} className="rounded-xl">
          <GlobeMesh selected={selected} />
        </Canvas>
        <p className="mt-3 text-center tech-label-sm">{t("hint")}</p>
      </div>
      <ul className="space-y-2">
        {regions.map((region) => (
          <li key={region.id}>
            <button
              type="button"
              onClick={() => setSelected(region.id)}
              className={cn(
                "w-full rounded-xl border px-4 py-4 text-left transition-colors",
                selected === region.id ? "border-pearl/60 bg-white/[0.04]" : "border-[var(--line)] hover:border-pearl/30",
              )}
            >
              <TechLabel index={region.index}>{t(`regions.${region.id}.name`)}</TechLabel>
              <p className="mt-2 text-[0.9rem] text-mist">{t(`regions.${region.id}.body`)}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
