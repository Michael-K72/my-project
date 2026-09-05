"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { accentPalette, useAppearance, type AccentId, type MaterialId } from "@/stores/appearance";
import { useUI } from "@/stores/ui";

function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between">
        <span className="tech-label-sm">{label}</span>
        <span className="font-mono text-[0.65rem] text-mist">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-px w-full cursor-pointer appearance-none bg-[var(--line-strong)] accent-[var(--accent)] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pearl"
      />
    </label>
  );
}

/** Realtime appearance builder. Every control writes to CSS tokens and the render state. */
export function AppearancePanel() {
  const t = useTranslations("appearance");
  const open = useUI((s) => s.appearanceOpen);
  const setOpen = useUI((s) => s.setAppearanceOpen);
  const a = useAppearance();

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label={t("title")}
          data-lenis-prevent
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="glass fixed bottom-20 right-4 z-[78] w-[min(92vw,20rem)] rounded-2xl p-5 md:right-6"
        >
          <header className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-[0.95rem] font-medium tracking-tight">{t("title")}</h2>
              <p className="text-[0.75rem] text-ash">{t("subtitle")}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line-strong)] text-mist hover:text-pearl">
              ×
            </button>
          </header>

          <div className="space-y-5">
            <div>
              <span className="tech-label-sm">{t("accent")}</span>
              <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t("accent")}>
                {(Object.keys(accentPalette) as AccentId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={a.accent === id}
                    aria-label={t(`accents.${id}`)}
                    onClick={() => a.set({ accent: id })}
                    className={cn("h-7 w-7 rounded-full border-2 transition-transform", a.accent === id ? "scale-110 border-pearl" : "border-transparent")}
                    style={{ background: accentPalette[id].hex }}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="tech-label-sm">{t("material")}</span>
              <div className="mt-2 grid grid-cols-2 gap-1.5" role="radiogroup" aria-label={t("material")}>
                {(["chrome", "titanium", "glass", "obsidian"] as MaterialId[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={a.material === m}
                    onClick={() => a.set({ material: m })}
                    className={cn("rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors", a.material === m ? "border-pearl bg-pearl text-obsidian" : "border-[var(--line-strong)] text-mist hover:text-pearl")}
                  >
                    {t(`materials.${m}`)}
                  </button>
                ))}
              </div>
            </div>
            <Range label={t("motion")} value={a.motionIntensity} min={0.4} max={1.4} onChange={(v) => a.set({ motionIntensity: v })} />
            <Range label={t("density")} value={a.density} min={0.3} max={1} onChange={(v) => a.set({ density: v })} />
            <Range label={t("lighting")} value={a.lighting} min={0.4} max={1.6} onChange={(v) => a.set({ lighting: v })} />
            <button type="button" onClick={a.reset} className="tech-label-sm underline-slide hover:text-mist">
              {t("reset")}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
