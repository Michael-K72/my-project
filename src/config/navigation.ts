/**
 * Navigation model. Labels are translation keys under `nav.*`.
 * `primary` items appear in the floating bar; `secondary` only in the overlay.
 */
export type NavItem = {
  id: string;
  href: string;
  labelKey: string;
  /** Short technical index shown in the overlay (e.g. 01). */
  index: string;
};

export const primaryNavigation: NavItem[] = [
  { id: "index", href: "/", labelKey: "index", index: "01" },
  { id: "configurator", href: "/configurator", labelKey: "configurator", index: "02" },
  { id: "store", href: "/store", labelKey: "commerce", index: "03" },
  { id: "book", href: "/book", labelKey: "book", index: "04" },
  { id: "lab", href: "/lab", labelKey: "lab", index: "05" },
];

export const secondaryNavigation: NavItem[] = [
  { id: "network", href: "/network", labelKey: "network", index: "06" },
  { id: "portal", href: "/portal", labelKey: "portal", index: "07" },
  { id: "contact", href: "/contact", labelKey: "contact", index: "08" },
];

export const legalNavigation: NavItem[] = [
  { id: "imprint", href: "/legal/imprint", labelKey: "imprint", index: "" },
  { id: "privacy", href: "/legal/privacy", labelKey: "privacy", index: "" },
  { id: "cookies", href: "/legal/cookies", labelKey: "cookies", index: "" },
  { id: "terms", href: "/legal/terms", labelKey: "terms", index: "" },
];

export const allNavigation = [...primaryNavigation, ...secondaryNavigation];
