"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Choice } from "@/components/ui/Field";
import { TechLabel } from "@/components/ui/TechLabel";
import {
  directionOptions,
  featureOptions,
  integrationOptions,
  languageOptions,
  motionOptions,
  pageOptions,
  projectTypeOptions,
  threeOptions,
} from "@/data/configurator";
import { formatCurrency } from "@/lib/utils";
import { ConfiguratorModel } from "./ConfiguratorModel";
import { useConfigurator, useEstimate } from "./store";

const STEPS = ["type", "direction", "three", "motion", "pages", "features", "languages", "integrations", "summary"] as const;

export function ConfiguratorStudio() {
  const t = useTranslations("configurator");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const config = useConfigurator((s) => s.config);
  const exploded = useConfigurator((s) => s.exploded);
  const setExploded = useConfigurator((s) => s.setExploded);
  const estimate = useEstimate();
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = STEPS[step];

  const text = useMemo(() => {
    const lines = [
      t("brief.heading"),
      "",
      `${t("brief.type")}: ${config.type ? t(`options.type.${config.type}`) : "—"}`,
      `${t("brief.direction")}: ${config.direction ? t(`options.direction.${config.direction}`) : "—"}`,
      `${t("brief.intensity")}: ${t(`options.three.${config.three}`)} / ${t(`options.motion.${config.motion}`)}`,
      `${t("brief.pages")}: ${config.pages.map((p) => t(`options.pages.${p}`)).join(", ")}`,
      `${t("brief.features")}: ${config.features.map((f) => t(`options.features.${f}`)).join(", ") || "—"}`,
      `${t("brief.languages")}: ${config.languages.map((l) => t(`options.languages.${l}`)).join(", ")}`,
      `${t("brief.integrations")}: ${config.integrations.map((i) => t(`options.integrations.${i}`)).join(", ")}`,
      "",
      `${t("summary.complexity")}: ${estimate.score}`,
      `${t("summary.range")}: ${formatCurrency(estimate.rangeLow, locale)} – ${formatCurrency(estimate.rangeHigh, locale)}`,
      `${t("summary.timeline")}: ${estimate.weeksLow}–${estimate.weeksHigh}`,
      "",
      t("brief.generated"),
    ];
    return lines.join("\n");
  }, [config, estimate, locale, t]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-brief.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <TechLabel index={String(step + 1).padStart(2, "0")}>{t(`steps.${current}`)}</TechLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExploded(!exploded)}
              className="rounded-full border border-[var(--line-strong)] px-3 py-1.5 text-[0.75rem] text-mist hover:text-pearl"
            >
              {exploded ? t("model.assemble") : t("model.explode")}
            </button>
          </div>
        </div>
        <ConfiguratorModel config={config} exploded={exploded} />
        <p className="mt-4 text-center tech-label-sm">{t("model.rotate")}</p>
        <StepBody step={current} brief={text} />
        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} icon={null}>
            {tCommon("previous")}
          </Button>
          <div className="flex gap-1" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1 w-6 rounded-full ${i === step ? "bg-accent" : "bg-white/10"}`} />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>
            {tCommon("next")}
          </Button>
        </div>
      </div>

      <aside className="panel sticky top-28 rounded-xl p-6" aria-label={t("summary.title")}>
        <TechLabel>{t("summary.title")}</TechLabel>
        <p className="mt-4 text-[0.75rem] text-ash">{t("disclaimer")}</p>
        <dl className="mt-6 space-y-3">
          <Row label={t("summary.complexity")} value={`${estimate.score}`} />
          <Row label={t("summary.score")} value={`${Math.round(estimate.normalised * 100)}`} />
          <Row label={t("summary.range")} value={`${formatCurrency(estimate.rangeLow, locale)} – ${formatCurrency(estimate.rangeHigh, locale)}`} />
          <Row label={t("summary.timeline")} value={`${estimate.weeksLow}–${estimate.weeksHigh}`} />
          <Row label={t("summary.layers")} value={String(estimate.layerCount)} />
        </dl>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-accent transition-all duration-700" style={{ width: `${estimate.normalised * 100}%` }} />
        </div>
        {current === "summary" && (
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="ghost" size="sm" onClick={copy} icon={null}>
              {copied ? tCommon("copied") : t("summary.copyBrief")}
            </Button>
            <Button variant="ghost" size="sm" onClick={download} icon={null}>
              {t("summary.downloadBrief")}
            </Button>
            <Button href="/contact" size="sm">
              {t("summary.sendInquiry")}
            </Button>
            <Button href="/book" variant="ghost" size="sm">
              {t("summary.bookConsultation")}
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[0.9rem]">
      <dt className="text-ash">{label}</dt>
      <dd className="numeral text-pearl">{value}</dd>
    </div>
  );
}

function StepBody({ step, brief }: { step: (typeof STEPS)[number]; brief: string }) {
  const t = useTranslations("configurator");
  const c = useConfigurator();

  if (step === "type") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox" aria-label={t("steps.type")}>
        {projectTypeOptions.map((id) => (
          <Choice key={id} selected={c.config.type === id} onClick={() => c.setType(id)}>
            {t(`options.type.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  if (step === "direction") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox">
        {directionOptions.map((id) => (
          <Choice key={id} selected={c.config.direction === id} onClick={() => c.setDirection(id)}>
            {t(`options.direction.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  if (step === "three") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox">
        {threeOptions.map((id) => (
          <Choice key={id} selected={c.config.three === id} onClick={() => c.setThree(id)}>
            {t(`options.three.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  if (step === "motion") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox">
        {motionOptions.map((id) => (
          <Choice key={id} selected={c.config.motion === id} onClick={() => c.setMotion(id)}>
            {t(`options.motion.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  if (step === "pages") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox">
        {pageOptions.map((id) => (
          <Choice key={id} selected={c.config.pages.includes(id)} onClick={() => c.togglePage(id)}>
            {t(`options.pages.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  if (step === "features") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox">
        {featureOptions.map((id) => (
          <Choice key={id} selected={c.config.features.includes(id)} onClick={() => c.toggleFeature(id)}>
            {t(`options.features.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  if (step === "languages") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox">
        {languageOptions.map((id) => (
          <Choice key={id} selected={c.config.languages.includes(id)} onClick={() => c.toggleLanguage(id)}>
            {t(`options.languages.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  if (step === "integrations") {
    return (
      <div className="mt-10 flex flex-wrap gap-2" role="listbox">
        {integrationOptions.map((id) => (
          <Choice key={id} selected={c.config.integrations.includes(id)} onClick={() => c.toggleIntegration(id)}>
            {t(`options.integrations.${id}`)}
          </Choice>
        ))}
      </div>
    );
  }
  return (
    <pre className="mt-10 max-h-64 overflow-auto rounded-lg border border-[var(--line)] bg-black/30 p-5 font-mono text-[0.75rem] leading-relaxed text-mist whitespace-pre-wrap">
      {brief}
    </pre>
  );
}
