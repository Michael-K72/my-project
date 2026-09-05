import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import { CheckoutForm } from "@/features/commerce/CheckoutForm";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/store/checkout", "store");
}

export default async function CheckoutPage({ params }: PageProps<"/[locale]/store/checkout">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <PageFrame shape={ParticleShape.LATTICE} cameraZ={11} opacity={0.25}>
      <PageHero label={t("payment")} title={t("title")} />
      <div className="px-[var(--gutter)] pb-24">
        <CheckoutForm />
      </div>
    </PageFrame>
  );
}
