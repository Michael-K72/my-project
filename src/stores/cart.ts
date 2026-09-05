"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct, getVariant, type VariantId, type ProductId } from "@/data/products";
import { resolveCoupon } from "@/lib/commerce/coupons";

export type CartLine = {
  id: string;
  productId: ProductId;
  variantId: VariantId;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  wishlist: ProductId[];
  coupon: string | null;
  lastAddedAt: number;
  add: (productId: ProductId, variantId: VariantId, quantity?: number) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  toggleWishlist: (productId: ProductId) => void;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  clear: () => void;
};

const lineId = (p: ProductId, v: VariantId) => `${p}:${v}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      wishlist: [],
      coupon: null,
      lastAddedAt: 0,
      add: (productId, variantId, quantity = 1) => {
        const id = lineId(productId, variantId);
        const existing = get().lines.find((l) => l.id === id);
        set({
          lastAddedAt: Date.now(),
          lines: existing
            ? get().lines.map((l) => (l.id === id ? { ...l, quantity: Math.min(9, l.quantity + quantity) } : l))
            : [...get().lines, { id, productId, variantId, quantity }],
        });
      },
      remove: (id) => set({ lines: get().lines.filter((l) => l.id !== id) }),
      setQuantity: (id, quantity) =>
        set({
          lines:
            quantity <= 0
              ? get().lines.filter((l) => l.id !== id)
              : get().lines.map((l) => (l.id === id ? { ...l, quantity: Math.min(9, quantity) } : l)),
        }),
      toggleWishlist: (productId) =>
        set({
          wishlist: get().wishlist.includes(productId)
            ? get().wishlist.filter((p) => p !== productId)
            : [...get().wishlist, productId],
        }),
      applyCoupon: (code) => {
        const coupon = resolveCoupon(code);
        if (!coupon) return false;
        set({ coupon: coupon.code });
        return true;
      },
      clearCoupon: () => set({ coupon: null }),
      clear: () => set({ lines: [], coupon: null }),
    }),
    { name: "mk-cart", skipHydration: true, partialize: (s) => ({ lines: s.lines, wishlist: s.wishlist, coupon: s.coupon }) },
  ),
);

/** Client-side totals for display only. The server recomputes everything at checkout. */
export function computeTotals(lines: CartLine[], couponCode: string | null) {
  const subtotal = lines.reduce((sum, line) => {
    const product = getProduct(line.productId);
    const variant = getVariant(line.productId, line.variantId);
    if (!product || !variant) return sum;
    return sum + variant.price * line.quantity;
  }, 0);
  const coupon = couponCode ? resolveCoupon(couponCode) : null;
  const discount = coupon ? Math.round(subtotal * coupon.percent) : 0;
  return { subtotal, discount, total: subtotal - discount, count: lines.reduce((n, l) => n + l.quantity, 0) };
}
