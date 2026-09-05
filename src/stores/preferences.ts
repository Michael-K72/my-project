"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MotionPreference = "full" | "reduced";
export type QualityTier = "high" | "medium" | "low";

type PreferencesState = {
  motion: MotionPreference;
  /** Whether the user explicitly chose motion (otherwise follows the OS setting). */
  motionExplicit: boolean;
  sound: boolean;
  quality: QualityTier;
  setMotion: (motion: MotionPreference) => void;
  toggleMotion: () => void;
  setSound: (sound: boolean) => void;
  toggleSound: () => void;
  setQuality: (quality: QualityTier) => void;
  syncWithSystem: (prefersReduced: boolean) => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      motion: "full",
      motionExplicit: false,
      sound: false,
      quality: "high",
      setMotion: (motion) => set({ motion, motionExplicit: true }),
      toggleMotion: () => set({ motion: get().motion === "full" ? "reduced" : "full", motionExplicit: true }),
      setSound: (sound) => set({ sound }),
      toggleSound: () => set({ sound: !get().sound }),
      setQuality: (quality) => set({ quality }),
      syncWithSystem: (prefersReduced) => {
        if (!get().motionExplicit) set({ motion: prefersReduced ? "reduced" : "full" });
      },
    }),
    {
      name: "mk-preferences",
      skipHydration: true,
      partialize: (s) => ({ motion: s.motion, motionExplicit: s.motionExplicit, sound: s.sound }),
    },
  ),
);

/** Convenience selector used by animation code. */
export const selectReducedMotion = (s: PreferencesState) => s.motion === "reduced";
