"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { ensureGsap, gsap } from "@/animations/gsap";
import { renderState } from "@/three/state";
import { useTransition } from "./store";
import { TRANSITION_IN_MS } from "./TransitionLink";

/**
 * Four transition families share one overlay element:
 *  - mask:     a large typographic-scale panel wipes up, then reveals downward
 *  - portal:   a circle grows from the click origin, the next page appears inside
 *  - particle: content dims while the particle universe destabilises and re-forms
 *  - depth:    the current page recedes in Z while the panel arrives
 */
export function TransitionOverlay() {
  const panel = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const { active, kind, origin, token, end } = useTransition();
  const pending = useRef(false);

  // IN
  useEffect(() => {
    if (!active || !panel.current) return;
    ensureGsap();
    pending.current = true;
    const el = panel.current;
    const page = document.getElementById("page-root");
    gsap.killTweensOf([el, label.current, page]);
    const inSec = TRANSITION_IN_MS / 1000;

    if (kind === "portal") {
      gsap.set(el, { clipPath: `circle(0% at ${origin.x * 100}% ${origin.y * 100}%)`, opacity: 1 });
      gsap.to(el, { clipPath: `circle(150% at ${origin.x * 100}% ${origin.y * 100}%)`, duration: inSec, ease: "power4.in" });
    } else if (kind === "particle") {
      gsap.set(el, { clipPath: "inset(0 0 0 0)", opacity: 0 });
      gsap.to(el, { opacity: 0.92, duration: inSec, ease: "power2.in" });
      gsap.to(renderState.particles, { turbulence: 2.2, duration: inSec, ease: "power2.in" });
    } else {
      gsap.set(el, { clipPath: "inset(100% 0 0 0)", opacity: 1 });
      gsap.to(el, { clipPath: "inset(0% 0 0 0)", duration: inSec, ease: "power4.inOut" });
      if (kind === "depth" && page) gsap.to(page, { scale: 0.94, opacity: 0.4, duration: inSec, ease: "power3.in", transformOrigin: "50% 50%" });
    }
    if (label.current) gsap.fromTo(label.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, delay: inSec * 0.4 });
  }, [active, kind, origin.x, origin.y, token]);

  // OUT – when the new route has mounted.
  useEffect(() => {
    if (!pending.current || !panel.current) return;
    const el = panel.current;
    const page = document.getElementById("page-root");
    pending.current = false;
    window.scrollTo(0, 0);
    if (page) gsap.set(page, { clearProps: "transform,opacity" });

    const done = () => {
      gsap.set(el, { clipPath: "inset(0 0 100% 0)", opacity: 0 });
      end();
    };
    const currentKind = useTransition.getState().kind;
    const tl = gsap.timeline({ onComplete: done, delay: 0.08 });
    if (label.current) tl.to(label.current, { opacity: 0, duration: 0.2 }, 0);
    if (currentKind === "portal") {
      tl.to(el, { clipPath: `circle(0% at 50% 50%)`, duration: 0.7, ease: "power4.inOut" }, 0);
    } else if (currentKind === "particle") {
      gsap.to(renderState.particles, { turbulence: 0, duration: 1.1, ease: "power3.out" });
      tl.to(el, { opacity: 0, duration: 0.6, ease: "power2.out" }, 0);
    } else {
      tl.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.75, ease: "power4.inOut" }, 0);
    }
    return () => {
      tl.kill();
    };
    // Runs on every pathname change; `end` is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      ref={panel}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] opacity-0"
      style={{
        clipPath: "inset(0 0 100% 0)",
        background: "radial-gradient(ellipse at 50% 40%, #0f131b 0%, #050609 70%)",
      }}
    >
      <span ref={label} className="tech-label absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0">
        MK · {String(token).padStart(2, "0")}
      </span>
    </div>
  );
}
