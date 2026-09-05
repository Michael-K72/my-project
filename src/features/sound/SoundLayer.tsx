"use client";

import { useEffect, useRef } from "react";
import { clientFeatures } from "@/config/features";
import { useTransition } from "@/features/transition/store";
import { usePreferences } from "@/stores/preferences";

/**
 * Optional, opt-in sound design synthesised with the Web Audio API – no
 * assets, nothing autoplays. Three cues: hover tick, transition tone, ambience.
 */
export function SoundLayer() {
  const enabled = usePreferences((s) => s.sound);
  const token = useTransition((s) => s.token);
  const ctx = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const ambience = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    if (!clientFeatures.sound || !enabled) {
      ambience.current?.gain.gain.setTargetAtTime(0, ctx.current?.currentTime ?? 0, 0.4);
      return;
    }
    const AC = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!ctx.current) {
      ctx.current = new AC();
      master.current = ctx.current.createGain();
      master.current.gain.value = 0.5;
      master.current.connect(ctx.current.destination);
    }
    const ac = ctx.current;
    const out = master.current!;
    ac.resume().catch(() => undefined);

    // Ambience: two detuned low sines through a slow LFO.
    if (!ambience.current) {
      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 52;
      const osc2 = ac.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 52.6;
      const gain = ac.createGain();
      gain.gain.value = 0;
      const lfo = ac.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ac.createGain();
      lfoGain.gain.value = 0.012;
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(out);
      osc.start();
      osc2.start();
      lfo.start();
      ambience.current = { osc, gain };
    }
    ambience.current.gain.gain.setTargetAtTime(0.035, ac.currentTime, 1.5);

    const tick = () => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(1800, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.05);
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.07);
      o.connect(g).connect(out);
      o.start();
      o.stop(ac.currentTime + 0.08);
    };
    let last = 0;
    const onEnter = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.("a, button")) return;
      const now = performance.now();
      if (now - last < 60) return;
      last = now;
      tick();
    };
    document.addEventListener("pointerenter", onEnter, true);
    return () => {
      document.removeEventListener("pointerenter", onEnter, true);
      ambience.current?.gain.gain.setTargetAtTime(0, ac.currentTime, 0.4);
    };
  }, [enabled]);

  // Deep transition tone.
  useEffect(() => {
    const ac = ctx.current;
    const out = master.current;
    if (!enabled || !ac || !out || token === 0) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(140, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(48, ac.currentTime + 0.9);
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.0);
    o.connect(g).connect(out);
    o.start();
    o.stop(ac.currentTime + 1.05);
  }, [token, enabled]);

  return null;
}
