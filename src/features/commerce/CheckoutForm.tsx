"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { getProduct } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { computeTotals, useCart } from "@/stores/cart";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);
  const totals = computeTotals(lines, coupon);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (lines.length === 0) {
    return (
      <div className="panel rounded-xl p-10 text-center">
        <p className="headline-md">{t("errors.empty")}</p>
        <Button href="/store" className="mt-6">
          {tCart("browse")}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setErrors({});
        setFormError(null);
        const fd = new FormData(e.currentTarget);
        const payload = {
          email: String(fd.get("email") ?? ""),
          name: String(fd.get("name") ?? ""),
          company: String(fd.get("company") ?? ""),
          address: String(fd.get("address") ?? ""),
          city: String(fd.get("city") ?? ""),
          postal: String(fd.get("postal") ?? ""),
          country: String(fd.get("country") ?? ""),
          coupon: coupon ?? "",
          lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
        };
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { ok?: boolean; orderId?: string; errors?: Record<string, string>; error?: string };
        setPending(false);
        if (!res.ok || !data.ok) {
          setErrors(data.errors ?? {});
          setFormError(data.error === "empty" ? t("errors.empty") : t("errors.generic"));
          return;
        }
        clear();
        router.push(`/store/checkout/success?order=${data.orderId}`);
      }}
    >
      <div className="space-y-10">
        <p className="rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-[0.8rem] text-accent">{t("demoMode")}</p>
        <fieldset>
          <legend className="tech-label mb-6">{t("contact")}</legend>
          <div className="grid gap-6 md:grid-cols-2">
            <Input name="email" type="email" required autoComplete="email" label={t("fields.email")} error={errors.email} />
            <Input name="name" required autoComplete="name" label={t("fields.name")} error={errors.name} />
            <Input name="company" autoComplete="organization" label={t("fields.company")} className="md:col-span-2" />
          </div>
        </fieldset>
        <fieldset>
          <legend className="tech-label mb-6">{t("billing")}</legend>
          <div className="grid gap-6 md:grid-cols-2">
            <Input name="address" required autoComplete="street-address" label={t("fields.address")} error={errors.address} className="md:col-span-2" />
            <Input name="city" required autoComplete="address-level2" label={t("fields.city")} error={errors.city} />
            <Input name="postal" required autoComplete="postal-code" label={t("fields.postal")} error={errors.postal} />
            <Input name="country" required autoComplete="country-name" defaultValue="Switzerland" label={t("fields.country")} error={errors.country} className="md:col-span-2" />
          </div>
        </fieldset>
        {formError && (
          <p role="alert" className="text-red-200">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("processing") : t("pay")}
        </Button>
        <p className="tech-label-sm">{t("secure")}</p>
      </div>
      <aside className="panel h-fit rounded-xl p-6">
        <h2 className="text-lg font-medium">{t("summary")}</h2>
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {lines.map((line) => {
            const product = getProduct(line.productId);
            if (!product) return null;
            const variant = product.variants.find((v) => v.id === line.variantId);
            return (
              <li key={line.id} className="flex justify-between py-3 text-[0.9rem]">
                <span>
                  {line.quantity} × {line.productId}
                </span>
                <span className="numeral">{variant ? formatCurrency(variant.price * line.quantity, locale) : ""}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-2 text-[0.9rem]">
          <div className="flex justify-between text-mist">
            <dt>{tCart("subtotal")}</dt>
            <dd className="numeral">{formatCurrency(totals.subtotal, locale)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-accent">
              <dt>{tCart("discount")}</dt>
              <dd className="numeral">−{formatCurrency(totals.discount, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-2 text-lg">
            <dt>{tCart("total")}</dt>
            <dd className="numeral">{formatCurrency(totals.total, locale)}</dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
