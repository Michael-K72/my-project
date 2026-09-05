"use client";

import { gsap } from "@/animations/gsap";
import { renderState } from "@/three/state";

/**
 * Clones a product visual, shrinks it and sends it along a curved path to the
 * cart anchor in the navigation. Purely presentational; the store update is
 * independent so the cart is correct even without the animation.
 */
export function flyToCart(source: HTMLElement) {
  if (renderState.reducedMotion) return;
  const anchor = document.getElementById("cart-anchor");
  if (!anchor) return;
  const from = source.getBoundingClientRect();
  const to = anchor.getBoundingClientRect();

  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: "0",
    zIndex: "95",
    pointerEvents: "none",
    willChange: "transform, opacity",
  } as CSSStyleDeclaration);
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  gsap
    .timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { scale: 0.7, duration: 0.18, ease: "power2.in" })
    .to(ghost, { x: dx * 0.55, y: dy - 120, scale: 0.35, duration: 0.42, ease: "power2.out" })
    .to(ghost, { x: dx, y: dy, scale: 0.08, opacity: 0.2, duration: 0.32, ease: "power3.in" });
}
