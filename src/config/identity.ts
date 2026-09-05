const LOCAL_SITE_URL = "http://localhost:3000";

/** Parse an absolute URL, ignoring empty/invalid values instead of throwing. */
function parseAbsoluteUrl(value: string | undefined): URL | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return undefined;
    }
  }
}

/**
 * Canonical site origin for metadata, sitemap, and robots.
 * Prefers NEXT_PUBLIC_SITE_URL, then Vercel production/deployment hosts,
 * then localhost for local development. Never returns an empty string.
 */
export function resolveSiteUrl(): string {
  const explicit = parseAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit.origin;

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  const vercel = parseAbsoluteUrl(vercelHost ? `https://${vercelHost}` : undefined);
  if (vercel) return vercel.origin;

  return LOCAL_SITE_URL;
}

/** Safe metadataBase — never constructed from an empty string. */
export function siteMetadataBase(): URL {
  return parseAbsoluteUrl(resolveSiteUrl()) ?? new URL(LOCAL_SITE_URL);
}

/**
 * Central identity configuration.
 * Everything that describes the person/brand behind the site lives here so it
 * can be changed in one place without touching scenes or components.
 */
export const identity = {
  /** Display name rendered as the 3D sculpture and throughout the UI. */
  name: "Michael Kalachin",
  firstName: "Michael",
  lastName: "Kalachin",
  /** Uppercase form used in typographic scenes and the particle name shape. */
  displayNameUpper: "MICHAEL KALACHIN",
  /** Two-line variant for the 3D hero (top line / bottom line). */
  nameLines: ["MICHAEL", "KALACHIN"] as const,
  tagline: "Digital Experiences",
  disciplines: ["Engineering", "Design", "Motion"] as const,
  location: {
    country: "Switzerland",
    cities: ["Zürich", "Luzern"],
    availability: "Remote · Europe / Global",
    /** Approximate coordinates used for the network globe (lat, lng). */
    base: { lat: 47.05, lng: 8.31 },
  },
  contact: {
    /** Placeholder – replace with the real inbox. */
    email: "hello@michaelkalachin.ch",
  },
  social: [
    { id: "github", label: "GitHub", href: "https://github.com/" },
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
  ] as const,
  /** Canonical site URL used for metadata. See resolveSiteUrl(). */
  siteUrl: resolveSiteUrl(),
  /** Build label shown in technical annotations. */
  build: "BUILD 01",
} as const;

export type Identity = typeof identity;
