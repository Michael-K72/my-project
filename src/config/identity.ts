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
  /** Canonical site URL used for metadata. Override with NEXT_PUBLIC_SITE_URL. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://michaelkalachin.ch",
  /** Build label shown in technical annotations. */
  build: "BUILD 01",
} as const;

export type Identity = typeof identity;
