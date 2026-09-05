/**
 * Configurator option model. Weights feed the complexity score; the 3D model
 * reads `layerKind` to decide which geometry a feature contributes.
 */
export const projectTypeOptions = ["corporate", "luxury", "ecommerce", "portfolio", "launch", "saas", "experience", "custom"] as const;
export const directionOptions = ["minimal", "editorial", "futuristic", "luxury", "experimental", "technical"] as const;
export const threeOptions = ["none", "subtle", "immersive", "cinematic"] as const;
export const motionOptions = ["standard", "advanced", "studio", "experimental"] as const;
export const pageOptions = ["home", "about", "services", "products", "shop", "dashboard", "blog", "booking", "contact", "custom"] as const;
export const featureOptions = [
  "ecommerce", "auth", "cms", "booking", "payments", "maps", "model3d", "realtime", "analytics", "i18n",
  "dashboard", "search", "ai", "forms", "upload", "portal", "animations", "charts",
] as const;
export const languageOptions = ["de", "en", "fr", "it", "es"] as const;
export const integrationOptions = ["stripe", "supabase", "vercel", "analytics", "crm", "calendar", "maps", "email", "api"] as const;

export type ProjectTypeOption = (typeof projectTypeOptions)[number];
export type DirectionOption = (typeof directionOptions)[number];
export type ThreeOption = (typeof threeOptions)[number];
export type MotionOption = (typeof motionOptions)[number];
export type PageOption = (typeof pageOptions)[number];
export type FeatureOption = (typeof featureOptions)[number];
export type LanguageOption = (typeof languageOptions)[number];
export type IntegrationOption = (typeof integrationOptions)[number];

export type LayerKind = "shell" | "orbit" | "rings" | "planes" | "particles" | "globe" | "interface" | "core";

export const featureLayer: Record<FeatureOption, LayerKind> = {
  ecommerce: "shell",
  payments: "shell",
  auth: "core",
  cms: "planes",
  booking: "rings",
  maps: "globe",
  model3d: "orbit",
  realtime: "particles",
  analytics: "particles",
  i18n: "planes",
  dashboard: "interface",
  portal: "interface",
  search: "core",
  ai: "orbit",
  forms: "planes",
  upload: "core",
  animations: "orbit",
  charts: "particles",
};

export const weights = {
  type: { corporate: 6, luxury: 9, ecommerce: 12, portfolio: 5, launch: 8, saas: 12, experience: 11, custom: 10 } as Record<ProjectTypeOption, number>,
  direction: { minimal: 1, editorial: 2, futuristic: 3, luxury: 3, experimental: 4, technical: 2 } as Record<DirectionOption, number>,
  three: { none: 0, subtle: 3, immersive: 7, cinematic: 11 } as Record<ThreeOption, number>,
  motion: { standard: 1, advanced: 3, studio: 6, experimental: 8 } as Record<MotionOption, number>,
  page: 1.2,
  feature: {
    ecommerce: 6, auth: 3, cms: 3, booking: 4, payments: 3, maps: 2.5, model3d: 4, realtime: 4, analytics: 2, i18n: 2.5,
    dashboard: 5, search: 2, ai: 4, forms: 1, upload: 1.5, portal: 5, animations: 2, charts: 2.5,
  } as Record<FeatureOption, number>,
  language: 1.5,
  integration: 1.2,
};

export type Configuration = {
  type: ProjectTypeOption | null;
  direction: DirectionOption | null;
  three: ThreeOption;
  motion: MotionOption;
  pages: PageOption[];
  features: FeatureOption[];
  languages: LanguageOption[];
  integrations: IntegrationOption[];
};

export const defaultConfiguration: Configuration = {
  type: null,
  direction: null,
  three: "subtle",
  motion: "advanced",
  pages: ["home", "contact"],
  features: [],
  languages: ["de"],
  integrations: ["vercel"],
};

export type Estimate = {
  score: number;
  /** 0..1 normalised complexity for visualisation. */
  normalised: number;
  rangeLow: number;
  rangeHigh: number;
  weeksLow: number;
  weeksHigh: number;
  layerCount: number;
};

/** Demo estimate. Clearly labelled as such in the UI. */
export function estimate(config: Configuration): Estimate {
  let score = 0;
  if (config.type) score += weights.type[config.type];
  if (config.direction) score += weights.direction[config.direction];
  score += weights.three[config.three];
  score += weights.motion[config.motion];
  score += config.pages.length * weights.page;
  score += config.features.reduce((s, f) => s + weights.feature[f], 0);
  score += Math.max(0, config.languages.length - 1) * weights.language;
  score += config.integrations.length * weights.integration;

  const normalised = Math.min(1, score / 110);
  const base = 6000 + score * 850;
  return {
    score: Math.round(score),
    normalised,
    rangeLow: Math.round(base / 500) * 500,
    rangeHigh: Math.round((base * 1.35) / 500) * 500,
    weeksLow: Math.max(3, Math.round(score / 6)),
    weeksHigh: Math.max(5, Math.round(score / 4)),
    layerCount: 1 + config.features.length + (config.three !== "none" ? 1 : 0),
  };
}
