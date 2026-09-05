"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Registers GSAP plugins once on the client. Safe to call repeatedly. */
export function ensureGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/** Shared easing tokens so timelines feel like one system. */
export const easing = {
  cinematic: "power4.inOut",
  out: "expo.out",
  soft: "power2.out",
  inOut: "power3.inOut",
} as const;

/** Shared duration tokens in seconds. */
export const durations = {
  micro: 0.25,
  ui: 0.45,
  transition: 0.7,
  scene: 1.1,
} as const;

export { gsap, ScrollTrigger, useGSAP };
