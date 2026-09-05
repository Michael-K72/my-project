import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/features/contact/ContactForm";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/contact", "contact");
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <PageFrame shape={ParticleShape.ORBITS} cameraZ={10.5} opacity={0.4}>
      <PageHero label={t("title")} title={t("title")} body={t("subtitle")} />
      <div className="mx-auto max-w-3xl px-[var(--gutter)] pb-24">
        <ContactForm />
      </div>
    </PageFrame>
  );
}
