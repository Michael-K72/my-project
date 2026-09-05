"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { TechLabel } from "@/components/ui/TechLabel";
import { identity } from "@/config/identity";
import { budgetOptions, projectTypes } from "@/data/booking";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, timelineOptions } from "@/lib/validation/contact";

export function ContactForm() {
  const t = useTranslations("contact");
  const tVal = useTranslations("validation");
  const tCfg = useTranslations("configurator.options");
  const tBook = useTranslations("book");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto mb-8 h-24 w-24 rounded-full border border-accent/40 bg-accent/10" />
        <h2 className="headline-md">{t("success.title")}</h2>
        <p className="body-lg mt-4">{t("success.body", { name: success })}</p>
        <Button className="mt-8" variant="ghost" onClick={() => setSuccess(null)}>
          {t("success.again")}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setErrors({});
        setFileError(null);
        const fd = new FormData(e.currentTarget);
        const file = fd.get("attachment");
        if (file instanceof File && file.size > 0) {
          if (!ALLOWED_UPLOAD_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
            setFileError(tVal("fileType"));
            setPending(false);
            return;
          }
          if (file.size > MAX_UPLOAD_BYTES) {
            setFileError(tVal("fileSize"));
            setPending(false);
            return;
          }
        }
        const payload = {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          company: String(fd.get("company") ?? ""),
          type: String(fd.get("type") ?? "custom"),
          budget: String(fd.get("budget") ?? "unsure"),
          timeline: String(fd.get("timeline") ?? "open"),
          message: String(fd.get("message") ?? ""),
        };
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { ok?: boolean; errors?: Record<string, string> };
        setPending(false);
        if (!res.ok || !data.ok) {
          setErrors(data.errors ?? {});
          return;
        }
        setSuccess(payload.name);
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Input name="name" required autoComplete="name" label={t("fields.name")} error={errors.name} />
        <Input name="email" type="email" required autoComplete="email" label={t("fields.email")} error={errors.email} />
        <Input name="company" autoComplete="organization" label={t("fields.company")} />
        <Select name="type" defaultValue="experience" label={t("fields.type")} error={errors.type}>
          {projectTypes.map((p) => (
            <option key={p} value={p}>
              {tCfg(`type.${p}`)}
            </option>
          ))}
        </Select>
        <Select name="budget" defaultValue="unsure" label={t("fields.budget")} error={errors.budget}>
          {budgetOptions.map((b) => (
            <option key={b} value={b}>
              {tBook(`budgets.${b}`)}
            </option>
          ))}
        </Select>
        <Select name="timeline" defaultValue="open" label={t("fields.timeline")} error={errors.timeline}>
          {timelineOptions.map((v) => (
            <option key={v} value={v}>
              {t(`timelines.${v}`)}
            </option>
          ))}
        </Select>
        <Textarea name="message" required label={t("fields.message")} error={errors.message} className="md:col-span-2" />
        <div className="md:col-span-2">
          <label className="block">
            <span className="tech-label-sm">{t("fields.attachment")}</span>
            <input
              name="attachment"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="mt-3 block w-full text-[0.85rem] text-mist file:mr-4 file:rounded-full file:border file:border-[var(--line-strong)] file:bg-transparent file:px-4 file:py-1.5 file:text-mist"
            />
          </label>
          <p className={`mt-2 text-[0.75rem] ${fileError ? "text-red-200" : "text-ash"}`}>{fileError ?? t("attachmentHint")}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("submit") : t("submit")}
        </Button>
        <div>
          <TechLabel>{t("direct")}</TechLabel>
          <a href={`mailto:${identity.contact.email}`} className="ml-3 underline-slide text-mist hover:text-pearl">
            {identity.contact.email}
          </a>
        </div>
      </div>
    </form>
  );
}
