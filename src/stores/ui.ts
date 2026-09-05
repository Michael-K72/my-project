"use client";

import { create } from "zustand";

export type CursorVariant = "default" | "view" | "drag" | "open" | "select" | "hidden";

type UIState = {
  menuOpen: boolean;
  paletteOpen: boolean;
  cartOpen: boolean;
  surfaceOpen: boolean;
  appearanceOpen: boolean;
  loaderDone: boolean;
  cursor: CursorVariant;
  cursorLabel: string | null;
  setMenuOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
  togglePalette: () => void;
  setCartOpen: (open: boolean) => void;
  setSurfaceOpen: (open: boolean) => void;
  setAppearanceOpen: (open: boolean) => void;
  setLoaderDone: () => void;
  setCursor: (variant: CursorVariant, label?: string | null) => void;
  closeAll: () => void;
};

export const useUI = create<UIState>()((set, get) => ({
  menuOpen: false,
  paletteOpen: false,
  cartOpen: false,
  surfaceOpen: false,
  appearanceOpen: false,
  loaderDone: false,
  cursor: "default",
  cursorLabel: null,
  setMenuOpen: (menuOpen) => set({ menuOpen, paletteOpen: false, cartOpen: false }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen, menuOpen: false }),
  togglePalette: () => set({ paletteOpen: !get().paletteOpen, menuOpen: false }),
  setCartOpen: (cartOpen) => set({ cartOpen, menuOpen: false }),
  setSurfaceOpen: (surfaceOpen) => set({ surfaceOpen, menuOpen: false, paletteOpen: false }),
  setAppearanceOpen: (appearanceOpen) => set({ appearanceOpen }),
  setLoaderDone: () => set({ loaderDone: true }),
  setCursor: (cursor, cursorLabel = null) => set({ cursor, cursorLabel }),
  closeAll: () => set({ menuOpen: false, paletteOpen: false, cartOpen: false, appearanceOpen: false }),
}));
