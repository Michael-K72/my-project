/** Tiny class-name joiner; avoids a dependency for a one-liner. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Maps a value from [inMin, inMax] to [0, 1], clamped. */
export const range = (value: number, inMin: number, inMax: number) =>
  clamp((value - inMin) / (inMax - inMin), 0, 1);

/** Smoothstep easing for scroll-driven transitions. */
export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Deterministic pseudo-random in [0,1) from an integer seed (Mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic CHF-style formatting. Avoids Node vs browser ICU mismatches. */
export function formatCurrency(value: number, _locale: string, currency = "CHF") {
  const grouped = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2019");
  return `${grouped} ${currency}`;
}

export function formatDate(date: Date, locale: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Europe/Zurich",
    ...(options ?? { day: "numeric", month: "long", year: "numeric" }),
  }).format(date);
}

export function formatTime(date: Date, locale: string, timeZone?: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(date);
}

/** Generates a short human-readable reference like MK-7F3A2. */
export function shortReference(prefix = "MK") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${out}`;
}

export const isBrowser = typeof window !== "undefined";
