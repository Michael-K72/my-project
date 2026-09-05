"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Choice, Input, Select, Textarea } from "@/components/ui/Field";
import { TechLabel } from "@/components/ui/TechLabel";
import { bookingServices, bookingTimezone, budgetOptions, projectTypes } from "@/data/booking";
import { formatDate } from "@/lib/utils";
import { OrbitCalendar } from "./OrbitCalendar";
import { demoSlotsFor } from "./availability";

const STEPS = ["service", "date", "time", "details", "confirm"] as const;

export function BookingFlow() {
  const t = useTranslations("book");
  const tCfg = useTranslations("configurator.options");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<(typeof bookingServices)[number]["id"]>("discovery");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(bookingTimezone);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ reference: string; email: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const slots = useMemo(() => (date ? demoSlotsFor(date) : []), [date]);

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || bookingTimezone);
    } catch {
      setTimezone(bookingTimezone);
    }
  }, []);

  if (result) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <TechLabel tone="accent">{t("confirmed.reference")}</TechLabel>
        <p className="numeral mt-4 text-3xl tracking-tight">{result.reference}</p>
        <h2 className="headline-md mt-8">{t("confirmed.title")}</h2>
        <p className="body-lg mt-4">{t("confirmed.body", { email: result.email })}</p>
        <p className="mt-6 text-[0.8rem] text-ash">{t("confirmed.demo")}</p>
        <Button href="/" className="mt-10">
          {t("steps.confirm")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <TechLabel index={String(step + 1).padStart(2, "0")}>{t(`steps.${STEPS[step]}`)}</TechLabel>

        {STEPS[step] === "service" && (
          <ul className="mt-8 grid gap-3">
            {bookingServices.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className={`w-full rounded-xl border px-5 py-5 text-left transition-colors ${
                    serviceId === s.id ? "border-pearl/70 bg-pearl text-obsidian" : "border-[var(--line-strong)] hover:border-pearl/30"
                  }`}
                >
                  <span className="tech-label-sm">{s.index}</span>
                  <span className="mt-2 block text-xl font-medium">{t(`services.${s.id}.name`)}</span>
                  <span className="mt-1 block text-[0.9rem] opacity-70">
                    {t(`services.${s.id}.duration`)} · {t(`services.${s.id}.body`)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {STEPS[step] === "date" && (
          <div className="mt-8">
            <OrbitCalendar
              value={date}
              onSelect={(iso) => {
                setDate(iso);
                setTime(null);
              }}
            />
          </div>
        )}

        {STEPS[step] === "time" && (
          <div className="mt-8">
            <p className="tech-label mb-4">{t("availableSlots")}</p>
            {slots.length === 0 ? (
              <p className="text-mist">{t("noSlots")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <Choice key={slot} selected={time === slot} onClick={() => setTime(slot)}>
                    {slot}
                  </Choice>
                ))}
              </div>
            )}
            <label className="mt-8 block">
              <span className="tech-label-sm">{t("timezone")}</span>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-2 w-full border-b border-[var(--line-strong)] bg-transparent py-2 outline-none focus:border-accent"
              />
            </label>
          </div>
        )}

        {STEPS[step] === "details" && (
          <form
            id="booking-details"
            className="mt-8 grid gap-6 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!date || !time) return;
              setPending(true);
              setErrors({});
              const fd = new FormData(e.currentTarget);
              const payload = {
                serviceId,
                date,
                time,
                timezone,
                name: String(fd.get("name") ?? ""),
                email: String(fd.get("email") ?? ""),
                company: String(fd.get("company") ?? ""),
                budget: String(fd.get("budget") ?? "unsure"),
                type: String(fd.get("type") ?? "custom"),
                message: String(fd.get("message") ?? ""),
              };
              const res = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = (await res.json()) as { ok?: boolean; reference?: string; email?: string; errors?: Record<string, string> };
              setPending(false);
              if (!res.ok || !data.ok || !data.reference) {
                setErrors(data.errors ?? {});
                return;
              }
              setResult({ reference: data.reference, email: payload.email });
            }}
          >
            <Input name="name" required autoComplete="name" label={t("fields.name")} error={errors.name} />
            <Input name="email" type="email" required autoComplete="email" label={t("fields.email")} error={errors.email} />
            <Input name="company" autoComplete="organization" label={t("fields.company")} />
            <Select name="budget" defaultValue="unsure" label={t("fields.budget")}>
              {budgetOptions.map((b) => (
                <option key={b} value={b}>
                  {t(`budgets.${b}`)}
                </option>
              ))}
            </Select>
            <Select name="type" defaultValue="experience" label={t("fields.type")} className="md:col-span-2">
              {projectTypes.map((p) => (
                <option key={p} value={p}>
                  {tCfg(`type.${p}`)}
                </option>
              ))}
            </Select>
            <Textarea name="message" label={t("fields.message")} className="md:col-span-2" />
          </form>
        )}

        <div className="mt-10 flex justify-between">
          <Button variant="ghost" size="sm" icon={null} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            ←
          </Button>
          {STEPS[step] === "details" ? (
            <Button type="submit" form="booking-details" disabled={pending}>
              {pending ? t("confirming") : t("confirm")}
            </Button>
          ) : (
            <Button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={(STEPS[step] === "date" && !date) || (STEPS[step] === "time" && !time)}
            >
              {t("confirm")}
            </Button>
          )}
        </div>
      </div>

      <aside className="panel h-fit rounded-xl p-6">
        <TechLabel>{t("summary")}</TechLabel>
        <dl className="mt-5 space-y-3 text-[0.9rem]">
          <div>
            <dt className="tech-label-sm">{t("steps.service")}</dt>
            <dd>{t(`services.${serviceId}.name`)}</dd>
          </div>
          <div>
            <dt className="tech-label-sm">{t("steps.date")}</dt>
            <dd>{date ? formatDate(new Date(date), locale) : "—"}</dd>
          </div>
          <div>
            <dt className="tech-label-sm">{t("steps.time")}</dt>
            <dd>
              {time ?? "—"} · {timezone}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
