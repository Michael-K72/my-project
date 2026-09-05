"use client";

import { create } from "zustand";

export type AccentId = "ice" | "violet" | "silver" | "pearl";
export type MaterialId = "chrome" | "titanium" | "glass" | "obsidian";

export const accentPalette: Record<AccentId, { hex: string; soft: string; glow: string }> = {
  ice: { hex: "#bfe3ff", soft: "rgba(191,227,255,0.14)", glow: "rgba(191,227,255,0.35)" },
  violet: { hex: "#9b8cff", soft: "rgba(155,140,255,0.16)", glow: "rgba(155,140,255,0.4)" },
  silver: { hex: "#d9dde3", soft: "rgba(217,221,227,0.12)", glow: "rgba(217,221,227,0.3)" },
  pearl: { hex: "#ece9e2", soft: "rgba(236,233,226,0.12)", glow: "rgba(236,233,226,0.3)" },
};

export type AppearanceState = {
  accent: AccentId;
  /** 0.4 – 1.4; multiplies motion amplitude and durations. */
  motionIntensity: number;
  /** 0.3 – 1.5; multiplies rendered particle fraction. */
  density: number;
  material: MaterialId;
  /** 0.4 – 1.6; environment light intensity. */
  lighting: number;
  set: (patch: Partial<Omit<AppearanceState, "set" | "reset">>) => void;
  reset: () => void;
};

const defaults = {
  accent: "ice" as AccentId,
  motionIntensity: 1,
  density: 1,
  material: "chrome" as MaterialId,
  lighting: 1,
};

export const useAppearance = create<AppearanceState>()((set) => ({
  ...defaults,
  set: (patch) => set(patch),
  reset: () => set(defaults),
}));

export const appearanceDefaults = defaults;
