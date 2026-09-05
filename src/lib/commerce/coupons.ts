/** Demo coupons. Shared by client (display) and server (validation). */
export type Coupon = { code: string; percent: number };

const coupons: Coupon[] = [{ code: "STUDIO10", percent: 0.1 }];

export function resolveCoupon(code: string | null | undefined): Coupon | null {
  if (!code) return null;
  const normalised = code.trim().toUpperCase();
  return coupons.find((c) => c.code === normalised) ?? null;
}
