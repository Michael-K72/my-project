import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import { PortalDashboard } from "@/features/portal/PortalDashboard";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/portal", "portal");
}

export default async function PortalPage({ params }: PageProps<"/[locale]/portal">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");

  return (
    <PageFrame shape={ParticleShape.LATTICE} cameraZ={12} opacity={0.22}>
      <PageHero
        label={t("title")}
        title={t("title")}
        body={t("disclaimer")}
        badge={<span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">{t("badge")}</span>}
      />
      <div className="px-[var(--gutter)] pb-24">
        <PortalDashboard />
      </div>
    </PageFrame>
  );
}
