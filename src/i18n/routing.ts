import { defineRouting } from "next-intl/routing";

export const locales = ["de", "en", "fr", "it", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeMeta: Record<Locale, { label: string; native: string; short: string; currency: string }> = {
  de: { label: "German", native: "Deutsch", short: "DE", currency: "CHF" },
  en: { label: "English", native: "English", short: "EN", currency: "CHF" },
  fr: { label: "French", native: "Français", short: "FR", currency: "CHF" },
  it: { label: "Italian", native: "Italiano", short: "IT", currency: "CHF" },
  es: { label: "Spanish", native: "Español", short: "ES", currency: "CHF" },
};

export const routing = defineRouting({
  locales,
  defaultLocale: "de",
  localePrefix: "always",
});
