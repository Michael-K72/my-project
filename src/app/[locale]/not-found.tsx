import { getTranslations } from "next-intl/server";
import { ErrorExperience } from "@/features/errors/ErrorExperience";

export default async function NotFoundPage() {
  const t = await getTranslations("errors.notFound");
  return <ErrorExperience code={t("code")} title={t("title")} body={t("body")} cta={t("cta")} href="/" />;
}
