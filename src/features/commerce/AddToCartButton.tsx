"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { ProductId, VariantId } from "@/data/products";
import { useCart } from "@/stores/cart";
import { flyToCart } from "./flyToCart";

type Props = {
  productId: ProductId;
  variantId: VariantId;
  sourceId: string;
};

export function AddToCartButton({ productId, variantId, sourceId }: Props) {
  const t = useTranslations("store");
  const add = useCart((s) => s.add);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="inline-flex">
      <Button
        size="lg"
        onClick={() => {
          add(productId, variantId);
          const source = document.getElementById(sourceId) ?? ref.current;
          if (source) flyToCart(source);
        }}
      >
        {t("addToCart")}
      </Button>
    </div>
  );
}
