"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { primaryNavigation } from "@/config/navigation";
import { identity } from "@/config/identity";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { computeTotals, useCart } from "@/stores/cart";
import { useUI } from "@/stores/ui";
import { renderState } from "@/three/state";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ScrollOrbit } from "./ScrollOrbit";

function CartButton() {
  const t = useTranslations("a11y");
  const setCartOpen = useUI((s) => s.setCartOpen);
  const lines = useCart((s) => s.lines);
  const lastAddedAt = useCart((s) => s.lastAddedAt);
  const count = computeTotals(lines, null).count;
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!lastAddedAt) return;
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 700);
    return () => window.clearTimeout(id);
  }, [lastAddedAt]);

  return (
    <button
      type="button"
      id="cart-anchor"
      onClick={() => setCartOpen(true)}
      aria-label={t("openCart")}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full transition-[transform,background-color] duration-500 [transition-timing-function:var(--ease-out-expo)] hover:bg-white/[0.06]",
        pulse && "scale-110 bg-accent/20",
      )}
    >
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d="M4 6.5h12l-1 9H5l-1-9Z" />
        <path d="M7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[0.6rem] text-obsidian">
          {count}
        </span>
      )}
    </button>
  );
}

export function Navigation() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const menuOpen = useUI((s) => s.menuOpen);
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const loaderDone = useUI((s) => s.loaderDone);
  const bar = useRef<HTMLElement>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Hide the labels in the bar once the visitor is deep in a scene – keeps focus on content.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      setScrolledPastHero((prev) => (y > 120 ? true : y < 60 ? false : prev));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      ref={bar}
      className={cn(
        "fixed left-0 right-0 top-0 z-[70] flex justify-center px-4 pt-4 transition-[opacity,transform] duration-1000 [transition-timing-function:var(--ease-out-expo)] md:pt-5",
        loaderDone ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
      )}
      data-layer="interaction"
    >
      <nav
        aria-label="Primary"
        className={cn(
          "glass flex h-12 items-center gap-1 rounded-full pl-2 pr-2 transition-[gap,padding] duration-700 [transition-timing-function:var(--ease-out-expo)] md:h-[3.25rem] md:pl-3",
        )}
      >
        <TransitionLink
          href="/"
          transition="particle"
          aria-label={identity.name}
          className="group flex items-center gap-2.5 rounded-full px-2 py-1.5 transition-colors hover:bg-white/[0.05]"
        >
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-[var(--line-strong)] font-mono text-[0.625rem] tracking-[0.05em]">
            MK
          </span>
          <span
            className={cn(
              "hidden items-center gap-2 pr-1 transition-[opacity,max-width] duration-700 [transition-timing-function:var(--ease-out-expo)] lg:flex",
              scrolledPastHero ? "max-w-0 overflow-hidden opacity-0" : "max-w-[220px] opacity-100",
            )}
          >
            <span className="h-1 w-1 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)]" />
            <span className="tech-label-sm whitespace-nowrap text-mist">{t("status")}</span>
          </span>
        </TransitionLink>

        <span className="mx-1 hidden h-4 w-px bg-[var(--line-strong)] md:block" />

        <ul className="hidden items-center md:flex">
          {primaryNavigation.map((item) => (
            <li key={item.id}>
              <TransitionLink
                href={item.href}
                transition={item.id === "index" ? "particle" : "mask"}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative block rounded-full px-3 py-1.5 text-[0.8125rem] tracking-tight transition-colors duration-400",
                  isActive(item.href) ? "text-pearl" : "text-mist hover:text-pearl",
                )}
              >
                {t(item.labelKey)}
                {isActive(item.href) && <span className="absolute bottom-0.5 left-1/2 h-px w-3 -translate-x-1/2 bg-accent" />}
              </TransitionLink>
            </li>
          ))}
        </ul>

        <span className="mx-1 hidden h-4 w-px bg-[var(--line-strong)] md:block" />

        <div className="flex items-center gap-0.5">
          <div className="hidden px-1 sm:block">
            <ScrollOrbit size={26} />
          </div>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label={t("command")}
            className="hidden h-9 items-center gap-1.5 rounded-full px-2.5 font-mono text-[0.625rem] tracking-[0.1em] text-ash transition-colors hover:bg-white/[0.06] hover:text-pearl lg:flex"
          >
            <kbd className="rounded border border-[var(--line-strong)] px-1 py-0.5">⌘</kbd>
            <kbd className="rounded border border-[var(--line-strong)] px-1 py-0.5">K</kbd>
          </button>
          <CartButton />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="menu-overlay"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="group flex h-9 items-center gap-2 rounded-full pl-3 pr-2.5 transition-colors hover:bg-white/[0.06]"
            onPointerEnter={() => {
              renderState.camera.drift = 1.4;
            }}
            onPointerLeave={() => {
              renderState.camera.drift = 1;
            }}
          >
            <span className="hidden text-[0.8125rem] sm:block">{t("menu")}</span>
            <span className="relative flex h-3.5 w-4 flex-col justify-between" aria-hidden="true">
              <span className={cn("h-px w-full bg-current transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] origin-center", menuOpen && "translate-y-[6.5px] rotate-45")} />
              <span className={cn("h-px w-full bg-current transition-opacity duration-300", menuOpen && "opacity-0")} />
              <span className={cn("h-px w-full bg-current transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] origin-center", menuOpen && "-translate-y-[6.5px] -rotate-45")} />
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
