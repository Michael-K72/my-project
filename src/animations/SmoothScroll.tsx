"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ensureGsap, gsap, ScrollTrigger } from "./gsap";
import { renderState } from "@/three/state";
import { usePreferences } from "@/stores/preferences";
import { useUI } from "@/stores/ui";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Smooth scroll provider. Lenis drives the scroll; GSAP's ticker drives Lenis
 * so ScrollTrigger and the WebGL loop see a single, consistent scroll value.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reduced = usePreferences((s) => s.motion === "reduced");
  const locked = useUI((s) => s.menuOpen || s.paletteOpen || s.cartOpen || s.surfaceOpen);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    ensureGsap();
    const instance = new Lenis({
      lerp: reduced ? 1 : 0.09,
      smoothWheel: !reduced,
      syncTouch: false,
      wheelMultiplier: 0.95,
    });
    lenisRef.current = instance;
    setLenis(instance);

    const onScroll = ({ scroll, limit, velocity }: { scroll: number; limit: number; velocity: number }) => {
      renderState.scroll = limit > 0 ? scroll / limit : 0;
      renderState.velocity = velocity;
      ScrollTrigger.update();
    };
    instance.on("scroll", onScroll);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [reduced]);

  useEffect(() => {
    const instance = lenisRef.current;
    if (!instance) return;
    if (locked) instance.stop();
    else instance.start();
  }, [locked]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
