import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageFrame } from "@/components/layout/PageFrame";
import { Button } from "@/components/ui/Button";
import { TechLabel } from "@/components/ui/TechLabel";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "/store/checkout/success", "store");
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: PageProps<"/[locale]/store/checkout/success">) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("checkout.success");
  const order = typeof query.order === "string" ? query.order : "—";

  return (
    <PageFrame shape={ParticleShape.NAME} cameraZ={9} opacity={0.7} spin={0.2}>
      <section className="flex min-h-[80svh] flex-col items-center justify-center px-[var(--gutter)] py-32 text-center">
        <TechLabel tone="accent">{t("order")}</TechLabel>
        <p className="numeral mt-4 text-4xl tracking-tight">{order}</p>
        <h1 className="headline-lg mt-10 max-w-3xl">{t("title")}</h1>
        <p className="body-lg mt-5 max-w-xl">{t("body")}</p>
        <p className="mt-4 text-[0.85rem] text-ash">
          {t("status")}: {t("statusValue")}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/store">{t("backToStore")}</Button>
          <Button href="/" variant="ghost">
            {t("home")}
          </Button>
        </div>
      </section>
    </PageFrame>
  );
}
