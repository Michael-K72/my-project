"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/animations/gsap";
import { Button } from "@/components/ui/Button";
import { TechLabel } from "@/components/ui/TechLabel";
import { cn } from "@/lib/utils";
import { useUI } from "@/stores/ui";
import { usePreferences } from "@/stores/preferences";

const LAYERS = [
  { id: "background", depth: -3 },
  { id: "lighting", depth: -2 },
  { id: "three", depth: -1 },
  { id: "content", depth: 0 },
  { id: "interaction", depth: 1 },
  { id: "data", depth: 2 },
  { id: "commerce", depth: 3 },
  { id: "api", depth: 4 },
] as const;

const SPACING = 110;

type Pose = { rx: number; rz: number; s: number; spread: number };

/**
 * "Under the Surface": the live page becomes the CONTENT plane of an exploded
 * engineering diagram. Seven schematic planes fan out around it in Z; the
 * visitor can drag to rotate, then reassemble everything back into the page.
 */
export function SurfaceView() {
  const t = useTranslations("surface");
  const open = useUI((s) => s.surfaceOpen);
  const setOpen = useUI((s) => s.setSurfaceOpen);
  const reduced = usePreferences((s) => s.motion === "reduced");
  const planes = useRef<Array<HTMLDivElement | null>>([]);
  const pose = useRef<Pose>({ rx: 0, rz: 0, s: 1, spread: 0 });
  const drag = useRef<{ x: number; y: number; rx: number; rz: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const apply = () => {
    const { rx, rz, s, spread } = pose.current;
    const page = document.getElementById("page-root");
    const three = document.querySelector<HTMLElement>('[data-layer="three"]');
    const base = (depth: number) => `perspective(1800px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s}) translateZ(${depth * SPACING * spread}px)`;
    if (page) {
      page.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
      page.style.transform = base(0);
    }
    if (three) {
      three.style.transformOrigin = "50% 50%";
      three.style.transform = base(-1);
      three.style.opacity = String(1 - spread * 0.3);
    }
    planes.current.forEach((el, i) => {
      if (!el) return;
      const depth = LAYERS[i].depth;
      el.style.transform = base(depth);
      el.style.opacity = String(spread * (depth === 0 ? 0 : 1));
    });
  };

  useEffect(() => {
    ensureGsap();
    const page = document.getElementById("page-root");
    const three = document.querySelector<HTMLElement>('[data-layer="three"]');
    if (!page) return;
    const target: Pose = open ? { rx: 54, rz: -30, s: 0.5, spread: 1 } : { rx: 0, rz: 0, s: 1, spread: 0 };
    document.body.style.overflow = open ? "hidden" : "";
    page.style.willChange = "transform";
    const tween = gsap.to(pose.current, {
      ...target,
      duration: reduced ? 0.4 : 1.4,
      ease: "power4.inOut",
      onUpdate: apply,
      onComplete: () => {
        if (!open) {
          page.style.transform = "";
          page.style.transformOrigin = "";
          page.style.willChange = "";
          if (three) {
            three.style.transform = "";
            three.style.opacity = "";
          }
        }
      },
    });
    return () => {
      tween.kill();
    };
    // apply is a stable closure over refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const onDown = (e: React.PointerEvent) => {
    if (reduced) return;
    drag.current = { x: e.clientX, y: e.clientY, rx: pose.current.rx, rz: pose.current.rz };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    pose.current.rz = drag.current.rz + dx * 0.15;
    pose.current.rx = Math.max(20, Math.min(80, drag.current.rx - dy * 0.15));
    apply();
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <>
      {/* Schematic planes – always mounted so transforms are continuous; hidden until spread > 0. */}
      <div className="pointer-events-none fixed inset-0 z-[9]" aria-hidden="true">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.id}
            ref={(el) => {
              planes.current[i] = el;
            }}
            className="absolute inset-0 opacity-0 will-change-transform"
            style={{ transformOrigin: "50% 50%" }}
          >
            {layer.depth !== 0 && (
              <div className={cn("absolute inset-[6%] rounded-md border", layer.depth < 0 ? "border-[var(--line-strong)]" : "border-accent/40")}>
                <Schematic id={layer.id} />
                <div className="absolute -right-3 top-1/2 flex -translate-y-1/2 translate-x-full items-center gap-3 whitespace-nowrap">
                  <span className="h-px w-8 bg-[var(--line-strong)]" />
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-pearl">{t(`layers.${layer.id}.name`)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={stageRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            className="fixed inset-0 z-[75] touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ cursor: reduced ? "default" : "grab" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_40%,rgba(5,6,9,0.85)_100%)]" />
            <div className="pointer-events-none absolute left-[var(--gutter)] top-28 max-w-sm">
              <TechLabel dot>{t("title")}</TechLabel>
              <p className="headline-md mt-4">{t("subtitle")}</p>
              <span className="tech-label-sm mt-3 block">{t("hint")}</span>
            </div>
            <motion.ol
              className="pointer-events-auto absolute bottom-24 left-[var(--gutter)] hidden max-w-xs space-y-2 md:block"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {[...LAYERS].reverse().map((l) => (
                <li key={l.id} className="flex items-baseline gap-3 text-[0.8rem]">
                  <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ash">{String(l.depth + 4).padStart(2, "0")}</span>
                  <span className="w-24 shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-pearl">{t(`layers.${l.id}.name`)}</span>
                  <span className="text-ash">{t(`layers.${l.id}.body`)}</span>
                </li>
              ))}
            </motion.ol>
            <div className="pointer-events-auto absolute bottom-8 right-[var(--gutter)]">
              <Button variant="primary" size="lg" onClick={() => setOpen(false)}>
                {t("reassemble")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Schematic({ id }: { id: (typeof LAYERS)[number]["id"] }) {
  switch (id) {
    case "background":
      return <div className="absolute inset-0 rounded-md bg-[radial-gradient(ellipse_at_50%_40%,rgba(191,227,255,0.08),transparent_70%)]" />;
    case "lighting":
      return (
        <>
          <span className="absolute left-[20%] top-[15%] h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
          <span className="absolute right-[15%] top-[40%] h-32 w-32 rounded-full bg-violet/15 blur-3xl" />
          <span className="absolute bottom-[10%] left-[45%] h-20 w-20 rounded-full bg-pearl/10 blur-2xl" />
        </>
      );
    case "three":
      return (
        <svg className="absolute inset-0 h-full w-full text-pearl/40" fill="none" stroke="currentColor" strokeWidth="0.6" viewBox="0 0 100 60" preserveAspectRatio="none">
          <ellipse cx="50" cy="30" rx="34" ry="12" />
          <ellipse cx="50" cy="30" rx="34" ry="12" transform="rotate(60 50 30)" />
          <ellipse cx="50" cy="30" rx="34" ry="12" transform="rotate(-60 50 30)" />
        </svg>
      );
    case "interaction":
      return (
        <div className="absolute inset-0 p-[8%]">
          <span className="absolute left-[8%] top-[8%] h-px w-[30%] bg-accent/60" />
          <span className="absolute left-[8%] top-[8%] h-[40%] w-px bg-accent/60" />
          <span className="absolute right-[8%] top-[30%] rounded-full border border-accent/60 px-3 py-1 font-mono text-[0.55rem] tracking-[0.14em] text-accent">SCROLL → 0.62</span>
          <span className="absolute bottom-[10%] left-[40%] h-8 w-8 rounded-full border border-accent/60" />
        </div>
      );
    case "data":
      return (
        <pre className="absolute left-[6%] top-[8%] font-mono text-[0.55rem] leading-relaxed text-pearl/60">
          {`{ locale: "de", cart: 2,\n  motion: "full",\n  scene: "system/03" }`}
        </pre>
      );
    case "commerce":
      return (
        <div className="absolute inset-0 p-[8%]">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-10 rounded-sm border border-accent/40" />
            ))}
          </div>
          <span className="mt-3 block font-mono text-[0.55rem] tracking-[0.14em] text-accent">priceOrder(lines) → server</span>
        </div>
      );
    case "api":
      return (
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          {["PaymentProvider", "BookingProvider", "EmailProvider"].map((p) => (
            <span key={p} className="rounded-sm border border-accent/40 px-2 py-1 font-mono text-[0.55rem] tracking-[0.1em] text-pearl/80">
              {p}
            </span>
          ))}
        </div>
      );
    default:
      return null;
  }
}
