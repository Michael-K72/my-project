"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Choice } from "@/components/ui/Field";
import { TechLabel } from "@/components/ui/TechLabel";
import type { Product, VariantId } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { AddToCartButton } from "./AddToCartButton";
import { ProductObject } from "./ProductObject";

export function ProductDetail({ product }: { product: Product }) {
  const t = useTranslations("store");
  const locale = useLocale();
  const [variantId, setVariantId] = useState<VariantId>(product.defaultVariant);
  const wishlist = useCart((s) => s.wishlist);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const saved = wishlist.includes(product.id);
  const includes = t.raw(`products.${product.id}.includes`) as string[];

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div id={`product-visual-${product.id}`} className="panel relative flex aspect-square items-center justify-center overflow-hidden rounded-xl">
        <ProductObject layers={product.layers} tint={product.tint} size={280} interactive explode={0.35} />
      </div>
      <div>
        <TechLabel index={product.index}>{t("conceptual")}</TechLabel>
        <h1 className="headline-lg mt-4">{t(`products.${product.id}.name`)}</h1>
        <p className="mt-3 text-lg text-mist">{t(`products.${product.id}.tagline`)}</p>
        <p className="body-lg mt-6">{t(`products.${product.id}.description`)}</p>
        <div className="mt-8">
          <TechLabel>{t("variant")}</TechLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <Choice key={v.id} selected={v.id === variantId} onClick={() => setVariantId(v.id)}>
                {t(`variants.${v.id}`)} · {formatCurrency(v.price, locale)}
              </Choice>
            ))}
          </div>
        </div>
        <p className="numeral mt-8 text-4xl tracking-tight">{formatCurrency(variant.price, locale)}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <AddToCartButton productId={product.id} variantId={variantId} sourceId={`product-visual-${product.id}`} />
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className="h-14 rounded-full border border-[var(--line-strong)] px-6 text-[0.9rem] text-mist hover:text-pearl"
          >
            {saved ? t("wishlisted") : t("wishlist")}
          </button>
        </div>
        <div className="mt-10">
          <TechLabel>{t("includes")}</TechLabel>
          <ul className="mt-4 space-y-2">
            {includes.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[0.95rem] text-mist">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
