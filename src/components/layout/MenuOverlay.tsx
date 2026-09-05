"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { identity } from "@/config/identity";
import { allNavigation, legalNavigation } from "@/config/navigation";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/preferences";
import { useUI } from "@/stores/ui";
import { renderState } from "@/three/state";
import { LanguageSwitcher } from "./LanguageSwitcher";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Full-screen spatial menu. The navigation pill expands into a dark plane,
 * page labels enter sequentially, and a live description previews each route.
 */
export function MenuOverlay() {
  const t = useTranslations("nav");
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const pathname = usePathname();
  const reduced = usePreferences((s) => s.motion === "reduced");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    renderState.camera.z = 12;
    renderState.particles.spin = 2.2;
    return () => {
      window.removeEventListener("keydown", onKey);
      renderState.particles.spin = 1;
    };
  }, [open, setOpen]);

  const previewId = hovered ?? allNavigation.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)))?.id ?? "index";
  const previewKey = previewId === "commerce" ? "store" : previewId;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu")}
          className="fixed inset-0 z-[80] flex flex-col overflow-hidden"
          initial={{ clipPath: reduced ? "inset(0 0 0 0)" : "inset(4% 8% 92% 8% round 40px)", opacity: reduced ? 0 : 1 }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1 }}
          exit={{ clipPath: reduced ? "inset(0 0 0 0)" : "inset(4% 8% 92% 8% round 40px)", opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.85, ease }}
          data-lenis-prevent
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(14,18,26,0.96),rgba(5,6,9,0.98))] backdrop-blur-xl" />
          <div className="absolute inset-0 grid-fragment opacity-40" />

          <div className="relative flex h-full flex-col px-[var(--gutter)] pb-8 pt-28 md:pt-32">
            <div className="grid flex-1 grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
              <nav aria-label="Menu">
                <ul className="flex flex-col">
                  {allNavigation.map((item, i) => {
                    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <motion.li
                        key={item.id}
                        initial={{ y: reduced ? 0 : 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: reduced ? 0 : -20, opacity: 0 }}
                        transition={{ duration: 0.8, ease, delay: reduced ? 0 : 0.15 + i * 0.045 }}
                        className="border-b border-[var(--line)] last:border-b-0"
                      >
                        <TransitionLink
                          href={item.href}
                          transition={item.id === "index" ? "particle" : i % 2 === 0 ? "mask" : "portal"}
                          onMouseEnter={() => setHovered(item.id)}
                          onFocus={() => setHovered(item.id)}
                          onMouseLeave={() => setHovered(null)}
                          className={cn(
                            "group flex items-baseline gap-5 py-3 md:py-4 transition-colors",
                            active ? "text-pearl" : "text-mist hover:text-pearl",
                          )}
                        >
                          <span className="font-mono text-[0.6875rem] tracking-[0.18em] text-ash">{item.index}</span>
                          <span className="headline-md !text-[clamp(2rem,5.2vw,4.5rem)] tracking-[-0.04em] transition-transform duration-600 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-3">
                            {t(item.labelKey)}
                          </span>
                          {active && <span className="ml-auto h-1.5 w-1.5 self-center rounded-full bg-accent" />}
                        </TransitionLink>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease, delay: reduced ? 0 : 0.4 }}
                className="flex flex-col justify-between gap-10 lg:pl-10 lg:border-l lg:border-[var(--line)]"
              >
                <div className="min-h-[7rem]">
                  <span className="tech-label">{t("experience")}</span>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={previewKey}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="body-lg mt-4 max-w-md text-pearl/85"
                    >
                      {t(`previews.${previewKey}` as never)}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="space-y-8">
                  <div>
                    <span className="tech-label">{t("language")}</span>
                    <LanguageSwitcher variant="full" className="mt-3" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {legalNavigation.map((l) => (
                      <TransitionLink key={l.id} href={l.href} className="tech-label-sm underline-slide hover:text-mist">
                        {t(l.labelKey)}
                      </TransitionLink>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--line)] pt-6">
                    <span className="tech-label-sm">{identity.location.country} · {identity.location.availability}</span>
                    <a href={`mailto:${identity.contact.email}`} className="underline-slide text-[0.875rem] text-mist hover:text-pearl">
                      {identity.contact.email}
                    </a>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
