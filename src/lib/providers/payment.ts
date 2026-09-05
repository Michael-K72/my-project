import "server-only";
import { priceOrder, type PricedOrder } from "@/lib/commerce/pricing";
import { shortReference } from "@/lib/utils";
import type { CheckoutInput } from "@/lib/validation/checkout";

export type PaymentResult = {
  orderId: string;
  mode: "demo";
  order: PricedOrder;
};

/**
 * Payment adapter. Demo checkout never claims a real charge succeeded.
 * Swap this module for a Stripe (test/live) implementation when credentials exist.
 */
export async function chargeOrder(input: CheckoutInput): Promise<PaymentResult> {
  const order = priceOrder(input.lines, input.coupon || null);
  if (order.lines.length === 0) throw new Error("empty");
  return { orderId: shortReference("ORD"), mode: "demo", order };
}
