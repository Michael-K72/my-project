"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getProduct } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { computeTotals, useCart } from "@/stores/cart";
import { usePreferences } from "@/stores/preferences";
import { useUI } from "@/stores/ui";
import { ProductObject } from "./ProductObject";

const ease = [0.16, 1, 0.3, 1] as const;

export function CartDrawer() {
  const t = useTranslations("cart");
  const tStore = useTranslations("store");
  const tA11y = useTranslations("a11y");
  const locale = useLocale();
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const applyCoupon = useCart((s) => s.applyCoupon);
  const clearCoupon = useCart((s) => s.clearCoupon);
  const lastAddedAt = useCart((s) => s.lastAddedAt);
  const reduced = usePreferences((s) => s.motion === "reduced");
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const totals = computeTotals(lines, coupon);

  // Open softly after an add-to-cart, once the fly animation has landed.
  useEffect(() => {
    if (!lastAddedAt) return;
    const id = window.setTimeout(() => setOpen(true), reduced ? 0 : 900);
    return () => window.clearTimeout(id);
  }, [lastAddedAt, setOpen, reduced]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[82]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <button type="button" aria-label={tA11y("closeCart")} onClick={() => setOpen(false)} className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            data-lenis-prevent
            initial={{ x: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            transition={{ duration: reduced ? 0.2 : 0.7, ease }}
            className="glass absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-l-2xl"
          >
            <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
              <div>
                <h2 className="text-lg font-medium tracking-tight">{t("title")}</h2>
                <span className="tech-label-sm">{t("items", { count: totals.count })}</span>
              </div>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={tA11y("closeCart")} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-strong)] text-mist transition-colors hover:text-pearl">
                ×
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="h-16 w-16 rounded-full border border-dashed border-[var(--line-strong)]" />
                  <p className="text-lg font-medium tracking-tight">{t("empty")}</p>
                  <p className="text-[0.9rem] text-ash">{t("emptyBody")}</p>
                  <Button href="/store" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                    {t("browse")}
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => {
                      const product = getProduct(line.productId);
                      const variant = product?.variants.find((v) => v.id === line.variantId);
                      if (!product || !variant) return null;
                      return (
                        <motion.li
                          key={line.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 30, height: 0 }}
                          transition={{ duration: 0.4, ease }}
                          className="flex items-center gap-4 py-4"
                        >
                          <ProductObject layers={product.layers} tint={product.tint} size={64} />
                          <div className="flex-1">
                            <p className="text-[0.95rem]">{tStore(`products.${product.id}.name`)}</p>
                            <span className="tech-label-sm">{tStore(`variants.${variant.id}`)}</span>
                            <div className="mt-2 flex items-center gap-2">
                              <button type="button" aria-label={t("decrease")} onClick={() => setQuantity(line.id, line.quantity - 1)} className="h-7 w-7 rounded-full border border-[var(--line-strong)] text-mist hover:text-pearl">
                                −
                              </button>
                              <span className="numeral w-6 text-center text-sm" aria-label={t("quantity")}>
                                {line.quantity}
                              </span>
                              <button type="button" aria-label={t("increase")} onClick={() => setQuantity(line.id, line.quantity + 1)} className="h-7 w-7 rounded-full border border-[var(--line-strong)] text-mist hover:text-pearl">
                                +
                              </button>
                              <button type="button" onClick={() => remove(line.id)} className="tech-label-sm ml-3 underline-slide hover:text-mist">
                                {t("remove")}
                              </button>
                            </div>
                          </div>
                          <span className="numeral text-[0.95rem]">{formatCurrency(variant.price * line.quantity, locale)}</span>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="border-t border-[var(--line)] px-6 py-5">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const ok = applyCoupon(code);
                    setCouponError(!ok);
                    if (ok) setCode("");
                  }}
                >
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCouponError(false);
                    }}
                    placeholder={t("coupon")}
                    aria-label={t("coupon")}
                    aria-invalid={couponError}
                    className="h-10 flex-1 rounded-full border border-[var(--line-strong)] bg-transparent px-4 font-mono text-[0.8rem] uppercase tracking-[0.1em] outline-none focus:border-accent aria-[invalid=true]:border-red-300/70"
                  />
                  <button type="submit" className="h-10 rounded-full border border-[var(--line-strong)] px-4 text-[0.8rem] text-mist hover:text-pearl">
                    {t("applyCoupon")}
                  </button>
                </form>
                <p className="mt-2 min-h-4 text-[0.75rem]" role="status">
                  {couponError ? <span className="text-red-200">{t("couponInvalid")}</span> : coupon ? (
                    <span className="text-accent">
                      {t("couponApplied", { code: coupon })} ·{" "}
                      <button type="button" onClick={clearCoupon} className="underline">
                        {t("remove")}
                      </button>
                    </span>
                  ) : (
                    <span className="text-ash">{t("demoHint")}</span>
                  )}
                </p>
                <dl className="mt-4 space-y-1.5 text-[0.9rem]">
                  <div className="flex justify-between text-mist">
                    <dt>{t("subtotal")}</dt>
                    <dd className="numeral">{formatCurrency(totals.subtotal, locale)}</dd>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <dt>{t("discount")}</dt>
                      <dd className="numeral">−{formatCurrency(totals.discount, locale)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 text-lg font-medium">
                    <dt>{t("total")}</dt>
                    <dd className="numeral">{formatCurrency(totals.total, locale)}</dd>
                  </div>
                </dl>
                <Button href="/store/checkout" size="lg" className="mt-5 w-full" onClick={() => setOpen(false)}>
                  {t("checkout")}
                </Button>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
