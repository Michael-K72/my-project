/**
 * Feature flags. Server-only flags read secrets and must never be imported in
 * client components; client flags are safe to expose.
 */
export const clientFeatures = {
  /** Optional sound design (always off until the visitor enables it). */
  sound: true,
  /** Desktop-only custom cursor. */
  customCursor: true,
  /** Post-processing bloom on capable devices. */
  bloom: true,
  /** Under-the-surface exploded view. */
  surfaceView: true,
} as const;

export function serverFeatures() {
  return {
    /** Stripe test mode is enabled only when a secret key exists. */
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    /** Email delivery only when a provider key exists. */
    email: Boolean(process.env.RESEND_API_KEY),
  };
}
