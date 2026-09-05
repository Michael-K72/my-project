import { seeded } from "@/lib/utils";

/**
 * Deterministic demo availability. The same date always yields the same
 * slots so the UI is testable. A real BookingProvider replaces this module.
 */
export const DEMO_SLOT_TIMES = ["09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30"];

export function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isWeekend(d: Date) {
  const wd = d.getDay();
  return wd === 0 || wd === 6;
}

export function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Returns available slot times (HH:mm, Europe/Zurich) for a given ISO date. */
export function demoSlotsFor(iso: string): string[] {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (isWeekend(date)) return [];
  if (startOfDay(date) < startOfDay(new Date())) return [];
  const rand = seeded(y * 10000 + m * 100 + d);
  // Some days are fully booked; others keep 3–6 slots.
  if (rand() < 0.12) return [];
  return DEMO_SLOT_TIMES.filter(() => rand() > 0.38);
}

/** Density 0..1 used to size the day marker on the orbit calendar. */
export function demoDensity(iso: string): number {
  const slots = demoSlotsFor(iso);
  return slots.length / DEMO_SLOT_TIMES.length;
}
