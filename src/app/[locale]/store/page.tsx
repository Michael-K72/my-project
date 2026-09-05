import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import { StoreGrid } from "@/features/commerce/StoreGrid";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/store", "store");
}

export default async function StorePage({ params }: PageProps<"/[locale]/store">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("store");

  return (
    <PageFrame shape={ParticleShape.WAVE} cameraZ={11} opacity={0.35}>
      <PageHero label={t("title")} title={t("title")} body={t("subtitle")} />
      <div className="px-[var(--gutter)] pb-24">
        <StoreGrid />
      </div>
    </PageFrame>
  );
}
