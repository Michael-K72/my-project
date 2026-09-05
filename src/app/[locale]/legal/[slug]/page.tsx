import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

const slugs = ["imprint", "privacy", "cookies", "terms"] as const;
type LegalSlug = (typeof slugs)[number];

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!slugs.includes(slug as LegalSlug)) return {};
  return pageMetadata(locale as Locale, `/legal/${slug}`, "legal");
}

export default async function LegalPage({ params }: PageProps<"/[locale]/legal/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!slugs.includes(slug as LegalSlug)) notFound();
  const t = await getTranslations("legal");

  return (
    <PageFrame shape={ParticleShape.CHAOS} cameraZ={12} opacity={0.2} spin={0.2}>
      <PageHero label={t("placeholder")} title={t(`${slug as LegalSlug}.title`)} />
      <article className="mx-auto max-w-2xl px-[var(--gutter)] pb-24">
        <p className="body-lg">{t(`${slug as LegalSlug}.body`)}</p>
      </article>
    </PageFrame>
  );
}
