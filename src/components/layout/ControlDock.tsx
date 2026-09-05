"use client";

import { useTranslations } from "next-intl";
import { clientFeatures } from "@/config/features";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/preferences";
import { useUI } from "@/stores/ui";

/** Understated dock: Under the Surface, Appearance, Motion, Sound. */
export function ControlDock() {
  const tSurface = useTranslations("surface");
  const tAppearance = useTranslations("appearance");
  const tCommon = useTranslations("common");
  const surfaceOpen = useUI((s) => s.surfaceOpen);
  const setSurfaceOpen = useUI((s) => s.setSurfaceOpen);
  const appearanceOpen = useUI((s) => s.appearanceOpen);
  const setAppearanceOpen = useUI((s) => s.setAppearanceOpen);
  const loaderDone = useUI((s) => s.loaderDone);
  const motion = usePreferences((s) => s.motion);
  const toggleMotion = usePreferences((s) => s.toggleMotion);
  const sound = usePreferences((s) => s.sound);
  const toggleSound = usePreferences((s) => s.toggleSound);

  const item = "flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/[0.06] hover:text-pearl aria-pressed:text-accent";

  return (
    <div
      className={cn(
        "glass fixed bottom-4 right-4 z-[72] flex items-center gap-0.5 rounded-full p-1 transition-[opacity,transform] duration-1000 [transition-timing-function:var(--ease-out-expo)] md:bottom-6 md:right-6",
        loaderDone ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        surfaceOpen && "opacity-0 pointer-events-none",
      )}
      data-layer="interaction"
    >
      {clientFeatures.surfaceView && (
        <button type="button" onClick={() => setSurfaceOpen(true)} aria-label={tSurface("activate")} title={tSurface("activate")} className={item}>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M3 7.5 10 4l7 3.5-7 3.5-7-3.5Z" />
            <path d="M3 10.5 10 14l7-3.5" opacity="0.6" />
            <path d="M3 13.5 10 17l7-3.5" opacity="0.35" />
          </svg>
        </button>
      )}
      <button type="button" onClick={() => setAppearanceOpen(!appearanceOpen)} aria-pressed={appearanceOpen} aria-label={tAppearance("open")} title={tAppearance("open")} className={item}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.1">
          <circle cx="10" cy="10" r="6.5" />
          <path d="M10 3.5v13M3.5 10h13" opacity="0.5" />
          <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <button type="button" onClick={toggleMotion} aria-pressed={motion === "reduced"} aria-label={motion === "reduced" ? tCommon("motionOff") : tCommon("motionOn")} title={motion === "reduced" ? tCommon("motionOff") : tCommon("motionOn")} className={item}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.1">
          <path d="M2 10c2.5-4 5.5-4 8 0s5.5 4 8 0" />
          {motion === "reduced" && <path d="M3 17 17 3" />}
        </svg>
      </button>
      {clientFeatures.sound && (
        <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? tCommon("soundOn") : tCommon("soundOff")} title={sound ? tCommon("soundOn") : tCommon("soundOff")} className={item}>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M4 8v4h3l4 3V5L7 8H4Z" />
            {sound ? <path d="M14 7.5a4 4 0 0 1 0 5M16 5.5a7 7 0 0 1 0 9" /> : <path d="M14 8l4 4M18 8l-4 4" />}
          </svg>
        </button>
      )}
    </div>
  );
}
