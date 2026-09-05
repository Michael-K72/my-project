import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { ProductDetail } from "@/features/commerce/ProductDetail";
import { products, getProductBySlug } from "@/data/products";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ParticleShape } from "@/three/state";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const t = await getTranslations({ locale, namespace: "store" });
  const meta = await pageMetadata(locale as Locale, `/store/${slug}`, "store");
  return { ...meta, title: t(`products.${product.id}.name`) };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/store/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <PageFrame shape={ParticleShape.ORBITS} cameraZ={10.5} opacity={0.3}>
      <div className="px-[var(--gutter)] pb-24 pt-32 md:pt-40">
        <ProductDetail product={product} />
      </div>
    </PageFrame>
  );
}
