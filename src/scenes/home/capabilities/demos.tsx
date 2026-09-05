"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ensureGsap, gsap, ScrollTrigger } from "@/animations/gsap";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { TechLabel } from "@/components/ui/TechLabel";
import { cn, formatCurrency } from "@/lib/utils";
import { products } from "@/data/products";
import { flyToCart } from "@/features/commerce/flyToCart";
import { useCart } from "@/stores/cart";
import { usePreferences } from "@/stores/preferences";

/* ------------------------------------------------------------------ */
/* MOTION – a scroll-scrubbed timeline. Reversible by construction.      */
/* ------------------------------------------------------------------ */
export function MotionDemo() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureGsap();
    const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
    const head = el.querySelector<HTMLElement>("[data-head]");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 30%", scrub: 0.4 },
    });
    bars.forEach((bar, i) => {
      tl.fromTo(bar, { scaleX: 0 }, { scaleX: Number(bar.dataset.bar), ease: "none", duration: 1 }, i * 0.18);
    });
    if (head) tl.fromTo(head, { left: "0%" }, { left: "100%", ease: "none", duration: bars.length * 0.18 + 1 }, 0);
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const rows = [
    ["CAMERA", 0.85],
    ["LETTERS", 0.6],
    ["PARTICLES", 1],
    ["UI", 0.4],
    ["AUDIO", 0.25],
  ] as const;

  return (
    <div ref={ref} className="relative flex h-full flex-col justify-center gap-4 p-6 md:p-8">
      <div className="absolute inset-y-6 left-[calc(6rem+1.5rem)] right-6 md:left-[calc(6rem+2rem)] md:right-8">
        <span data-head className="absolute top-0 h-full w-px bg-accent/70" style={{ left: 0 }} />
      </div>
      {rows.map(([label, v]) => (
        <div key={label} className="flex items-center gap-4">
          <span className="tech-label-sm w-24 shrink-0">{label}</span>
          <span className="relative h-px flex-1 bg-[var(--line)]">
            <span data-bar={v} className="absolute inset-y-[-2px] left-0 w-full origin-left bg-pearl/80" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>
      ))}
      <ScrollTriggerGuard />
    </div>
  );
}

/** Ensures ScrollTrigger refreshes after fonts/layout settle for accurate scrub ranges. */
function ScrollTriggerGuard() {
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}

/* ------------------------------------------------------------------ */
/* 3D – a wireframe object that tilts toward the pointer.                */
/* ------------------------------------------------------------------ */
export function ThreeDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const cube = useRef<HTMLDivElement>(null);
  const reduced = usePreferences((s) => s.motion === "reduced");

  useEffect(() => {
    const el = ref.current;
    const c = cube.current;
    if (!el || !c) return;
    const rx = gsap.quickTo(c, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(c, "rotationY", { duration: 0.8, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      if (reduced) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rx(-y * 40 - 20);
      ry(x * 50 + 35);
    };
    const onLeave = () => {
      rx(-20);
      ry(35);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    const idle = reduced ? null : gsap.to(c, { rotationZ: 360, duration: 40, repeat: -1, ease: "none" });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      idle?.kill();
    };
  }, [reduced]);

  const faces = ["translateZ(70px)", "rotateY(180deg) translateZ(70px)", "rotateY(90deg) translateZ(70px)", "rotateY(-90deg) translateZ(70px)", "rotateX(90deg) translateZ(70px)", "rotateX(-90deg) translateZ(70px)"];

  return (
    <div ref={ref} className="flex h-full items-center justify-center [perspective:900px]" data-cursor>
      <div ref={cube} className="relative h-[140px] w-[140px] [transform-style:preserve-3d]" style={{ transform: "rotateX(-20deg) rotateY(35deg)" }}>
        {faces.map((tf, i) => (
          <div
            key={i}
            className={cn("absolute inset-0 border border-pearl/50", i === 0 && "bg-accent/10 border-accent/60")}
            style={{ transform: tf, backfaceVisibility: "visible" }}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_20px_var(--accent-glow)]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* COMMERCE – a real add-to-cart against the global cart store.           */
/* ------------------------------------------------------------------ */
export function CommerceDemo() {
  const t = useTranslations("store");
  const locale = useLocale();
  const add = useCart((s) => s.add);
  const product = products[1];
  const variant = product.variants.find((v) => v.id === product.defaultVariant) ?? product.variants[0];
  const tile = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    if (tile.current) flyToCart(tile.current);
    add(product.id, variant.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="flex h-full flex-col justify-between p-6 md:p-8">
      <div className="flex items-start justify-between">
        <TechLabel index={product.index}>{t("conceptual")}</TechLabel>
        <span className="numeral text-lg text-pearl">{formatCurrency(variant.price, locale)}</span>
      </div>
      <div ref={tile} className="mx-auto my-6 flex h-28 w-28 items-center justify-center [perspective:600px]">
        <div className="relative h-16 w-24 [transform-style:preserve-3d] [transform:rotateX(55deg)_rotateZ(-30deg)]">
          {Array.from({ length: product.layers }, (_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-sm border border-pearl/60 bg-graphite/70"
              style={{ transform: `translateZ(${i * 10}px)`, borderColor: i === product.layers - 1 ? product.tint : undefined }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.95rem] text-pearl">{t(`products.${product.id}.name`)}</p>
          <p className="text-[0.8rem] text-ash">{t(`products.${product.id}.tagline`)}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            "h-10 shrink-0 rounded-full px-5 text-[0.85rem] font-medium transition-all duration-500 [transition-timing-function:var(--ease-out-expo)]",
            added ? "bg-accent text-obsidian" : "bg-pearl text-obsidian hover:bg-ivory",
          )}
        >
          {added ? t("added") : t("addToCart")}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BOOKING – a week rendered as an orbit; slots appear radially.         */
/* ------------------------------------------------------------------ */
export function BookingDemo() {
  const t = useTranslations("book");
  const weekdays = t.raw("weekdays") as string[];
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const slots = ["09:00", "10:30", "13:00", "15:30"];
  const R = 88;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6" data-cursor>
      <div className="relative h-[220px] w-[220px]">
        <span className="absolute inset-0 rounded-full border border-[var(--line)]" />
        <span className={cn("absolute inset-[26%] rounded-full border border-dashed border-[var(--line)] transition-opacity duration-500", day === null ? "opacity-0" : "opacity-100")} />
        {weekdays.map((wd, i) => {
          const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
          const x = 110 + Math.cos(a) * R;
          const y = 110 + Math.sin(a) * R;
          const weekend = i >= 5;
          const active = day === i;
          return (
            <button
              key={wd}
              type="button"
              disabled={weekend}
              onClick={() => {
                setDay(i);
                setSlot(null);
              }}
              aria-pressed={active}
              className={cn(
                "absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[0.65rem] tracking-[0.1em] transition-all duration-500 [transition-timing-function:var(--ease-out-expo)]",
                weekend ? "text-ash/40" : active ? "scale-110 bg-pearl text-obsidian" : "text-mist hover:text-pearl hover:bg-white/[0.06]",
              )}
              style={{ left: x, top: y }}
            >
              {wd}
            </button>
          );
        })}
        {day !== null &&
          slots.map((s, i) => {
            const a = (i / slots.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / 4;
            const x = 110 + Math.cos(a) * 52;
            const y = 110 + Math.sin(a) * 52;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(i)}
                aria-pressed={slot === i}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 font-mono text-[0.6rem] tracking-[0.08em] transition-all duration-500 [transition-timing-function:var(--ease-out-expo)] animate-[fadein_0.5s_var(--ease-out-expo)_both]",
                  slot === i ? "border-accent bg-accent text-obsidian" : "border-[var(--line-strong)] bg-obsidian text-mist hover:text-pearl",
                )}
                style={{ left: x, top: y, animationDelay: `${i * 60}ms` }}
              >
                {s}
              </button>
            );
          })}
      </div>
      <span className="tech-label-sm h-4">
        {day === null ? t("selectDate") : slot === null ? t("selectTime") : `${weekdays[day]} · ${slots[slot]} · ${t("timezone")} CET`}
      </span>
      <style>{`@keyframes fadein { from { opacity: 0; transform: translate(-50%,-50%) scale(0.6);} to { opacity: 1; transform: translate(-50%,-50%) scale(1);} }`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DATA – a chart that draws itself when it enters the viewport.          */
/* ------------------------------------------------------------------ */
export function DataDemo() {
  const t = useTranslations("home.capabilities");
  const labels = t.raw("dataLabels") as string[];
  const ref = useRef<HTMLDivElement>(null);
  const values = [92, 78, 64, 99];
  const series = [12, 18, 15, 26, 30, 28, 38, 45, 43, 56, 61, 60, 72, 80];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureGsap();
    const path = el.querySelector<SVGPathElement>("[data-path]");
    const area = el.querySelector<SVGPathElement>("[data-area]");
    const bars = el.querySelectorAll<HTMLElement>("[data-value]");
    const nums = el.querySelectorAll<HTMLElement>("[data-num]");
    if (!path) return;
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.to(path, { strokeDashoffset: 0, duration: 1.8, ease: "power3.inOut" });
        if (area) gsap.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.8 });
        bars.forEach((b, i) => gsap.fromTo(b, { scaleX: 0 }, { scaleX: Number(b.dataset.value) / 100, duration: 1.2, delay: 0.3 + i * 0.1, ease: "expo.out" }));
        nums.forEach((n, i) => {
          const o = { v: 0 };
          gsap.to(o, { v: values[i], duration: 1.4, delay: 0.3 + i * 0.1, ease: "expo.out", onUpdate: () => (n.textContent = String(Math.round(o.v))) });
        });
      },
    });
    return () => st.kill();
    // values is a stable literal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const W = 320;
  const H = 120;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * W, H - (v / 100) * H] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div ref={ref} className="flex h-full flex-col justify-between gap-6 p-6 md:p-8">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.07)" />
        ))}
        <path data-area d={`${d} L${W},${H} L0,${H} Z`} fill="url(#area)" opacity="0" />
        <path data-path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.2" />
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {labels.map((label, i) => (
          <div key={label}>
            <div className="flex items-baseline justify-between">
              <span className="tech-label-sm">{label}</span>
              <span data-num className="numeral text-lg text-pearl">
                0
              </span>
            </div>
            <span className="mt-1.5 block h-px w-full bg-[var(--line)]">
              <span data-value={values[i]} className="block h-px w-full origin-left bg-pearl/80" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAPS – an SVG globe; the particle universe forms the real one behind.  */
/* ------------------------------------------------------------------ */
export function MapsDemo() {
  const t = useTranslations("network");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      <svg viewBox="0 0 200 200" className="h-44 w-44 text-pearl/70 animate-[spin_60s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden="true">
        <circle cx="100" cy="100" r="80" />
        <ellipse cx="100" cy="100" rx="80" ry="28" opacity="0.6" />
        <ellipse cx="100" cy="100" rx="80" ry="56" opacity="0.4" />
        <ellipse cx="100" cy="100" rx="28" ry="80" opacity="0.6" />
        <ellipse cx="100" cy="100" rx="56" ry="80" opacity="0.4" />
        <line x1="100" y1="20" x2="100" y2="180" opacity="0.6" />
        <line x1="20" y1="100" x2="180" y2="100" opacity="0.6" />
        <circle cx="112" cy="62" r="2.4" fill="var(--accent)" stroke="none" />
      </svg>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <TechLabel dot>{t("labels.available")}</TechLabel>
        <TechLabel>{t("labels.region")}</TechLabel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* I18N – the same word dissolves through five languages; switch is real. */
/* ------------------------------------------------------------------ */
export function I18nDemo() {
  const words = ["Erlebnis", "Experience", "Expérience", "Esperienza", "Experiencia"];
  const codes = ["DE", "EN", "FR", "IT", "ES"];
  const [i, setI] = useState(0);
  const reduced = usePreferences((s) => s.motion === "reduced");
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % words.length), reduced ? 3200 : 2200);
    return () => window.clearInterval(id);
  }, [reduced, words.length]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-6">
      <div className="relative h-16 w-full overflow-hidden text-center">
        {words.map((w, idx) => (
          <span
            key={w}
            aria-hidden={idx !== i}
            className={cn(
              "absolute inset-x-0 top-0 block text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.03em] transition-all duration-700 [transition-timing-function:var(--ease-out-expo)]",
              idx === i ? "translate-y-0 opacity-100 blur-0" : idx < i ? "-translate-y-6 opacity-0 blur-sm" : "translate-y-6 opacity-0 blur-sm",
            )}
          >
            {w}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="tech-label-sm">{codes[i]}</span>
        <span className="h-px w-8 bg-[var(--line-strong)]" />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
