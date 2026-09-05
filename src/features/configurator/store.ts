"use client";

import { create } from "zustand";
import {
  defaultConfiguration,
  estimate,
  type Configuration,
  type DirectionOption,
  type FeatureOption,
  type IntegrationOption,
  type LanguageOption,
  type MotionOption,
  type PageOption,
  type ProjectTypeOption,
  type ThreeOption,
} from "@/data/configurator";

type ConfiguratorState = {
  config: Configuration;
  exploded: boolean;
  setType: (type: ProjectTypeOption) => void;
  setDirection: (direction: DirectionOption) => void;
  setThree: (three: ThreeOption) => void;
  setMotion: (motion: MotionOption) => void;
  togglePage: (page: PageOption) => void;
  toggleFeature: (feature: FeatureOption) => void;
  toggleLanguage: (language: LanguageOption) => void;
  toggleIntegration: (integration: IntegrationOption) => void;
  setExploded: (exploded: boolean) => void;
  reset: () => void;
};

function toggle<T>(list: T[], value: T, min = 0): T[] {
  return list.includes(value) ? (list.length > min ? list.filter((v) => v !== value) : list) : [...list, value];
}

export const useConfigurator = create<ConfiguratorState>()((set) => ({
  config: defaultConfiguration,
  exploded: false,
  setType: (type) => set((s) => ({ config: { ...s.config, type } })),
  setDirection: (direction) => set((s) => ({ config: { ...s.config, direction } })),
  setThree: (three) => set((s) => ({ config: { ...s.config, three } })),
  setMotion: (motion) => set((s) => ({ config: { ...s.config, motion } })),
  togglePage: (page) => set((s) => ({ config: { ...s.config, pages: toggle(s.config.pages, page, 1) } })),
  toggleFeature: (feature) => set((s) => ({ config: { ...s.config, features: toggle(s.config.features, feature) } })),
  toggleLanguage: (language) => set((s) => ({ config: { ...s.config, languages: toggle(s.config.languages, language, 1) } })),
  toggleIntegration: (integration) => set((s) => ({ config: { ...s.config, integrations: toggle(s.config.integrations, integration) } })),
  setExploded: (exploded) => set({ exploded }),
  reset: () => set({ config: defaultConfiguration, exploded: false }),
}));

export function useEstimate() {
  return estimate(useConfigurator((s) => s.config));
}
