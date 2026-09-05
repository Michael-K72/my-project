"use client";

import { useLocale, useTranslations } from "next-intl";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { products } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { ProductObject } from "./ProductObject";

export function StoreGrid() {
  const t = useTranslations("store");
  const locale = useLocale();

  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const variant = product.variants.find((v) => v.id === product.defaultVariant) ?? product.variants[0];
        return (
          <li key={product.id}>
            <TransitionLink
              href={`/store/${product.slug}`}
              transition="portal"
              className="group panel relative flex h-full flex-col overflow-hidden rounded-xl p-6 transition-colors hover:border-pearl/25"
            >
              <span className="tech-label-sm">{product.index}</span>
              <div id={`product-visual-${product.id}`} className="mx-auto my-8">
                <ProductObject layers={product.layers} tint={product.tint} size={180} interactive />
              </div>
              <h2 className="headline-md text-[1.75rem]">{t(`products.${product.id}.name`)}</h2>
              <p className="mt-2 text-[0.95rem] text-mist">{t(`products.${product.id}.tagline`)}</p>
              <div className="mt-auto flex items-end justify-between pt-8">
                <span className="numeral text-lg">{formatCurrency(variant.price, locale)}</span>
                <span className="tech-label-sm text-accent">{t("viewProduct")}</span>
              </div>
              <span className="tech-label-sm mt-3 text-ash">{t("conceptual")}</span>
            </TransitionLink>
          </li>
        );
      })}
    </ul>
  );
}
