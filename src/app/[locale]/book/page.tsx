import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import { BookingFlow } from "@/features/booking/BookingFlow";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/book", "book");
}

export default async function BookPage({ params }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("book");

  return (
    <PageFrame shape={ParticleShape.RINGS} cameraZ={10.5} opacity={0.45} spin={0.35}>
      <PageHero label={t("title")} title={t("title")} body={t("subtitle")} />
      <div className="px-[var(--gutter)] pb-24">
        <BookingFlow />
      </div>
    </PageFrame>
  );
}
