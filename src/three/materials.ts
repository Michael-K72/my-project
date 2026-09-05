import type { MaterialId } from "@/stores/appearance";

export type PhysicalPreset = {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  thickness: number;
  ior: number;
  envMapIntensity: number;
};

export const materialPresets: Record<MaterialId, PhysicalPreset> = {
  chrome: {
    color: "#2a2e36",
    metalness: 1,
    roughness: 0.14,
    clearcoat: 0.8,
    clearcoatRoughness: 0.08,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    envMapIntensity: 1.6,
  },
  titanium: {
    color: "#6d727b",
    metalness: 0.92,
    roughness: 0.4,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    envMapIntensity: 1.1,
  },
  glass: {
    color: "#dfe7f0",
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    transmission: 1,
    thickness: 0.7,
    ior: 1.45,
    envMapIntensity: 1.2,
  },
  obsidian: {
    color: "#0b0d12",
    metalness: 0.35,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transmission: 0,
    thickness: 0,
    ior: 1.5,
    envMapIntensity: 1.3,
  },
};
