import type { MetadataRoute } from "next";
import { identity } from "@/config/identity";
import { allNavigation, legalNavigation } from "@/config/navigation";
import { products } from "@/data/products";
import { locales } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...allNavigation.map((n) => n.href),
    ...legalNavigation.map((n) => n.href),
    ...products.map((p) => `/store/${p.slug}`),
    "/store/checkout",
  ];
  const now = new Date();
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${identity.siteUrl}/${locale}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${identity.siteUrl}/${l}${path === "/" ? "" : path}`])),
      },
    })),
  );
}
