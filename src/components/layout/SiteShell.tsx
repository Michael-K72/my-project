"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { SmoothScroll } from "@/animations/SmoothScroll";
import { TransitionOverlay } from "@/features/transition/TransitionOverlay";
import { useCart } from "@/stores/cart";
import { usePreferences } from "@/stores/preferences";
import { accentPalette, useAppearance } from "@/stores/appearance";
import { CommandPalette } from "./CommandPalette";
import { ControlDock } from "./ControlDock";
import { CustomCursor } from "./CustomCursor";
import { Loader } from "./Loader";
import { MenuOverlay } from "./MenuOverlay";
import { Navigation } from "./Navigation";

// Heavy client-only layers are code-split and never rendered on the server.
const GlobalCanvas = dynamic(() => import("@/three/GlobalCanvas").then((m) => m.GlobalCanvas), { ssr: false });
const CartDrawer = dynamic(() => import("@/features/commerce/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const SurfaceView = dynamic(() => import("@/features/surface/SurfaceView").then((m) => m.SurfaceView), { ssr: false });
const AppearancePanel = dynamic(() => import("@/features/appearance/AppearancePanel").then((m) => m.AppearancePanel), { ssr: false });
const SoundLayer = dynamic(() => import("@/features/sound/SoundLayer").then((m) => m.SoundLayer), { ssr: false });

/** Rehydrate persisted stores after mount so SSR markup stays deterministic. */
function StoreRehydrate() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void usePreferences.persist.rehydrate();
  }, []);
  return null;
}

/** Syncs preferences to <html> attributes and CSS variables. */
function DocumentSync() {
  const motion = usePreferences((s) => s.motion);
  const syncWithSystem = usePreferences((s) => s.syncWithSystem);
  const appearance = useAppearance();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    syncWithSystem(mq.matches);
    const onChange = (e: MediaQueryListEvent) => syncWithSystem(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [syncWithSystem]);

  useEffect(() => {
    document.documentElement.setAttribute("data-motion", motion);
  }, [motion]);

  useEffect(() => {
    const root = document.documentElement.style;
    const accent = accentPalette[appearance.accent];
    root.setProperty("--accent", accent.hex);
    root.setProperty("--accent-soft", accent.soft);
    root.setProperty("--accent-glow", accent.glow);
    root.setProperty("--motion-scale", String(appearance.motionIntensity));
  }, [appearance.accent, appearance.motionIntensity]);

  return null;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  return (
    <SmoothScroll>
      <StoreRehydrate />
      <DocumentSync />
      <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-pearl px-4 py-2 text-obsidian">
        {t("skipToContent")}
      </a>
      <GlobalCanvas />
      <div className="vignette" aria-hidden="true" />
      <div id="page-root" className="relative z-10 will-change-transform" data-layer="content">
        {children}
      </div>
      <Navigation />
      <ControlDock />
      <MenuOverlay />
      <CommandPalette />
      <CartDrawer />
      <AppearancePanel />
      <SurfaceView />
      <SoundLayer />
      <TransitionOverlay />
      <CustomCursor />
      <div className="noise-layer" aria-hidden="true" />
      <Loader />
    </SmoothScroll>
  );
}
