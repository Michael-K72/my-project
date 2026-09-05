"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { demoDensity, isWeekend, startOfDay, toIsoDate } from "./availability";

type Props = {
  value?: string | null;
  onSelect?: (iso: string) => void;
  compact?: boolean;
  className?: string;
};

/**
 * A month rendered as an orbit. Days sit on a ring; availability density is
 * encoded as marker size and brightness. Fully keyboard-accessible via a
 * hidden native date input and arrow-key traversal of the ring.
 */
export function OrbitCalendar({ value = null, onSelect, compact = false, className }: Props) {
  const t = useTranslations("book");
  const locale = useLocale();
  const months = t.raw("months") as string[];
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const days = useMemo(() => {
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1));
  }, [cursor]);

  const size = compact ? 380 : 520;
  const R = size / 2 - (compact ? 34 : 46);
  const c = size / 2;
  const selected = value ? days.find((d) => toIsoDate(d) === value) : null;

  const move = (delta: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const targets = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button[data-day]");
    if (!targets) return;
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % targets.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + targets.length) % targets.length;
    else return;
    e.preventDefault();
    targets[next]?.focus();
  };

  return (
    <div className={cn("mx-auto w-full max-w-full", className)} style={{ maxWidth: size }}>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label={t("prevMonth")} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-strong)] text-mist transition-colors hover:text-pearl">
          ←
        </button>
        <div className="text-center">
          <span className="block text-lg font-medium tracking-tight">{months[cursor.getMonth()]}</span>
          <span className="tech-label-sm">{cursor.getFullYear()}</span>
        </div>
        <button type="button" onClick={() => move(1)} aria-label={t("nextMonth")} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-strong)] text-mist transition-colors hover:text-pearl">
          →
        </button>
      </div>

      <div className="relative mx-auto aspect-square w-full" role="listbox" aria-label={t("selectDate")}>
        <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx={c} cy={c} r={R} fill="none" stroke="rgba(255,255,255,0.10)" />
          <circle cx={c} cy={c} r={R * 0.62} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 6" />
          <circle cx={c} cy={c} r={R * 0.3} fill="none" stroke="rgba(255,255,255,0.05)" />
          {selected && (
            <line
              x1={c}
              y1={c}
              x2={c + Math.cos(((days.indexOf(selected) / days.length) * Math.PI * 2) - Math.PI / 2) * R}
              y2={c + Math.sin(((days.indexOf(selected) / days.length) * Math.PI * 2) - Math.PI / 2) * R}
              stroke="var(--accent)"
              strokeOpacity="0.5"
            />
          )}
        </svg>

        {days.map((d, i) => {
          const a = (i / days.length) * Math.PI * 2 - Math.PI / 2;
          const x = (50 + (Math.cos(a) * R * 100) / size).toFixed(3);
          const y = (50 + (Math.sin(a) * R * 100) / size).toFixed(3);
          const iso = toIsoDate(d);
          const past = d < today;
          const weekend = isWeekend(d);
          const density = past || weekend ? 0 : demoDensity(iso);
          const disabled = past || weekend || density === 0;
          const isSelected = value === iso;
          const isToday = d.getTime() === today.getTime();
          return (
            <button
              key={iso}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-disabled={disabled}
              aria-label={new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d) + (disabled ? ` · ${weekend ? t("weekend") : past ? t("past") : t("noSlots")}` : "")}
              data-day
              disabled={disabled}
              onClick={() => onSelect?.(iso)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "group absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-500 [transition-timing-function:var(--ease-out-expo)]",
                compact ? "h-8 w-8" : "h-10 w-10",
                disabled ? "cursor-not-allowed" : "hover:scale-110",
                isSelected && "scale-125 bg-pearl text-obsidian",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className={cn(
                  "font-mono tracking-[0.05em] transition-colors",
                  compact ? "text-[0.6rem]" : "text-[0.7rem]",
                  isSelected ? "text-obsidian" : disabled ? "text-ash/40" : "text-mist group-hover:text-pearl",
                )}
              >
                {d.getDate()}
              </span>
              {!disabled && !isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent"
                  style={{ opacity: 0.35 + density * 0.65, transform: `scale(${0.7 + density * 0.8})` }}
                />
              )}
              {isToday && !isSelected && <span aria-hidden="true" className="absolute inset-0 rounded-full border border-[var(--line-strong)]" />}
            </button>
          );
        })}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          {selected ? (
            <>
              <span className={cn("numeral block font-medium leading-none text-pearl", compact ? "text-5xl" : "text-7xl")}>{selected.getDate()}</span>
              <span className="tech-label-sm mt-2 block">{new Intl.DateTimeFormat(locale, { weekday: "long" }).format(selected)}</span>
            </>
          ) : (
            <span className="tech-label-sm block max-w-[8rem]">{t("selectDate")}</span>
          )}
        </div>
      </div>

      {/* Native fallback for assistive tech / keyboard-only users */}
      <label className="sr-only-focusable mt-3 block">
        <span className="tech-label-sm">{t("selectDate")}</span>
        <input
          type="date"
          className="mt-1 block rounded border border-[var(--line-strong)] bg-transparent px-2 py-1 text-sm"
          value={value ?? ""}
          min={toIsoDate(today)}
          onChange={(e) => e.target.value && onSelect?.(e.target.value)}
        />
      </label>
    </div>
  );
}
