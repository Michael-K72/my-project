import "server-only";
import { getProduct, getVariant } from "@/data/products";
import { resolveCoupon } from "./coupons";

export type PricedLine = {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type PricedOrder = {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  total: number;
  currency: "CHF";
  coupon: string | null;
};

/**
 * Server-side pricing. Never trusts client prices – only product/variant ids
 * and quantities. Throws on unknown items.
 */
export function priceOrder(
  input: { productId: string; variantId: string; quantity: number }[],
  couponCode: string | null,
): PricedOrder {
  const lines: PricedLine[] = input.map((line) => {
    const product = getProduct(line.productId);
    const variant = getVariant(line.productId, line.variantId);
    if (!product || !variant) throw new Error(`Unknown item ${line.productId}:${line.variantId}`);
    const quantity = Math.max(1, Math.min(9, Math.floor(line.quantity)));
    return {
      productId: product.id,
      variantId: variant.id,
      quantity,
      unitPrice: variant.price,
      lineTotal: variant.price * quantity,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const coupon = resolveCoupon(couponCode);
  const discount = coupon ? Math.round(subtotal * coupon.percent) : 0;
  return { lines, subtotal, discount, total: subtotal - discount, currency: "CHF", coupon: coupon?.code ?? null };
}
