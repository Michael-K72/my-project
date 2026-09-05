"use client";

import { useTranslations } from "next-intl";
import { ErrorExperience } from "@/features/errors/ErrorExperience";

export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors.server");
  return <ErrorExperience code={t("code")} title={t("title")} body={t("body")} cta={t("cta")} reset={reset} />;
}
