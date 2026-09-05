import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import { NetworkGlobe } from "@/features/network/NetworkGlobe";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/network", "network");
}

export default async function NetworkPage({ params }: PageProps<"/[locale]/network">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("network");

  return (
    <PageFrame shape={ParticleShape.GLOBE} cameraZ={10} opacity={0.3} spin={0.25}>
      <PageHero label={t("labels.available")} title={t("title")} body={t("subtitle")} />
      <div className="px-[var(--gutter)] pb-24">
        <p className="mb-10 flex flex-wrap gap-4 text-[0.8rem] text-mist">
          <span>{t("labels.available")}</span>
          <span>·</span>
          <span>{t("labels.remote")}</span>
          <span>·</span>
          <span>{t("labels.region")}</span>
        </p>
        <NetworkGlobe />
      </div>
    </PageFrame>
  );
}
