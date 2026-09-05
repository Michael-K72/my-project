import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { identity } from "@/config/identity";
import { locales, type Locale } from "@/i18n/routing";

type PageKey = "configurator" | "store" | "book" | "lab" | "network" | "portal" | "contact" | "legal";

/** Builds localized metadata with canonical + hreflang alternates for a route. */
export async function pageMetadata(locale: Locale, path: string, page?: PageKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = page ? t(`pages.${page}.title`) : t("title");
  const description = page ? t(`pages.${page}.description`) : t("description");
  const url = `${identity.siteUrl}/${locale}${path}`;

  return {
    title: page ? title : { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, `${identity.siteUrl}/${l}${path}`])),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: identity.name,
      locale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function personJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.name,
    url: `${identity.siteUrl}/${locale}`,
    jobTitle: identity.tagline,
    address: { "@type": "PostalAddress", addressCountry: "CH" },
    knowsAbout: ["Web Engineering", "Interaction Design", "WebGL", "Motion Design"],
  };
}
