"use client";

import { create } from "zustand";

export type TransitionKind = "portal" | "mask" | "particle" | "depth";

type TransitionState = {
  active: boolean;
  kind: TransitionKind;
  origin: { x: number; y: number };
  /** Increments each time a transition begins so listeners can react. */
  token: number;
  begin: (kind: TransitionKind, origin?: { x: number; y: number }) => void;
  end: () => void;
};

export const useTransition = create<TransitionState>()((set, get) => ({
  active: false,
  kind: "mask",
  origin: { x: 0.5, y: 0.5 },
  token: 0,
  begin: (kind, origin) => set({ active: true, kind, origin: origin ?? { x: 0.5, y: 0.5 }, token: get().token + 1 }),
  end: () => set({ active: false }),
}));
