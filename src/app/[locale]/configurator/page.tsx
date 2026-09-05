import { setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import { ConfiguratorStudio } from "@/features/configurator/ConfiguratorStudio";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/configurator", "configurator");
}

export default async function ConfiguratorPage({ params }: PageProps<"/[locale]/configurator">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("configurator");

  return (
    <PageFrame shape={ParticleShape.LATTICE} cameraZ={11} opacity={0.4}>
      <PageHero label={t("steps.type")} title={t("title")} body={t("subtitle")} />
      <div className="px-[var(--gutter)] pb-24">
        <ConfiguratorStudio />
      </div>
    </PageFrame>
  );
}
