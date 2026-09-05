"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition as useReactTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeMeta, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { gsap } from "@/animations/gsap";

type Props = { variant?: "compact" | "full"; className?: string };

/**
 * Preserves the current route while switching locale. The page content
 * briefly dissolves so the language change reads as one intentional motion.
 */
export function LanguageSwitcher({ variant = "compact", className }: Props) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("a11y");
  const [, startTransition] = useReactTransition();

  const change = (next: Locale) => {
    if (next === locale) return;
    const page = document.getElementById("page-root");
    const go = () =>
      startTransition(() => {
        // @ts-expect-error -- params are forwarded for dynamic segments (e.g. store/[slug])
        router.replace({ pathname, params }, { locale: next });
      });
    if (page) {
      gsap.to(page, {
        opacity: 0,
        y: -8,
        filter: "blur(6px)",
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          go();
          gsap.to(page, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, delay: 0.15, ease: "expo.out", clearProps: "filter,transform" });
        },
      });
    } else go();
  };

  if (variant === "full") {
    return (
      <ul className={cn("flex flex-wrap gap-x-6 gap-y-2", className)} aria-label={t("languageSwitch")}>
        {locales.map((l) => (
          <li key={l}>
            <button
              type="button"
              onClick={() => change(l)}
              aria-current={l === locale ? "true" : undefined}
              className={cn("underline-slide text-[0.9375rem] transition-colors", l === locale ? "text-pearl" : "text-ash hover:text-pearl")}
            >
              {localeMeta[l].native}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label={t("languageSwitch")}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "font-mono text-[0.625rem] tracking-[0.14em] px-1.5 py-1 rounded transition-colors",
            l === locale ? "text-pearl" : "text-ash hover:text-mist",
          )}
        >
          {localeMeta[l].short}
        </button>
      ))}
    </div>
  );
}
