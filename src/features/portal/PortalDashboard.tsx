"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ensureGsap, gsap, ScrollTrigger } from "@/animations/gsap";
import { TechLabel } from "@/components/ui/TechLabel";
import { activity, analytics, files, invoices, meetings, messages as demoMessages, milestones, portalProject, tasks } from "@/data/portal";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type Props = { compact?: boolean };

function Card({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("panel flex flex-col rounded-lg p-5", className)} aria-label={title}>
      <header className="mb-4 flex items-center justify-between">
        <span className="tech-label-sm">{title}</span>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status: "done" | "active" | "planned" | "paid" | "open" | "draft" }) {
  const t = useTranslations("portal.status");
  const tone =
    status === "done" || status === "paid"
      ? "border-accent/50 text-accent"
      : status === "active" || status === "open"
        ? "border-pearl/50 text-pearl"
        : "border-[var(--line-strong)] text-ash";
  return <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em]", tone)}>{t(status)}</span>;
}

function CompletionRing({ value }: { value: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const r = 54;
  const c = 2 * Math.PI * r;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureGsap();
    const o = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: value,
          duration: 1.6,
          ease: "expo.out",
          onUpdate: () => {
            el.style.strokeDashoffset = String(c * (1 - o.v));
            if (label.current) label.current.textContent = `${Math.round(o.v * 100)}`;
          },
        }),
    });
    return () => st.kill();
  }, [value, c]);
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle ref={ref} cx="64" cy="64" r={r} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray={c} strokeDashoffset={c} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="numeral text-3xl font-medium">
          <span ref={label}>0</span>
          <span className="text-base text-ash">%</span>
        </span>
      </div>
    </div>
  );
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const W = 240;
  const H = 60;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / (max - min || 1)) * (H - 6) - 3}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-16 w-full", className)} aria-hidden="true">
      <polyline points={pts.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.2" />
      {pts.map((p, i) => i === pts.length - 1 && <circle key={i} cx={p.split(",")[0]} cy={p.split(",")[1]} r="2.5" fill="var(--accent)" />)}
    </svg>
  );
}

export function PortalDashboard({ compact = false }: Props) {
  const t = useTranslations("portal");
  const locale = useLocale();
  const [thread, setThread] = useState(demoMessages);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setThread((m) => [
      ...m,
      { id: `c${m.length + 1}`, from: "Demo Client", initials: "DC", time: new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date()), body: draft.trim() },
    ]);
    setDraft("");
  };

  return (
    <div className={cn("glass rounded-xl p-3 md:p-4", compact && "pointer-events-none select-none")} data-layer="data">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line-strong)] font-mono text-[0.6rem]">MK</span>
          <div>
            <span className="block text-[0.95rem] font-medium tracking-tight">{portalProject.name}</span>
            <span className="tech-label-sm">
              {portalProject.id} · {portalProject.phase}
            </span>
          </div>
        </div>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">{t("badge")}</span>
      </div>

      <div className={cn("grid gap-3", compact ? "md:grid-cols-4" : "md:grid-cols-6")}>
        <Card title={t("completion")} className={compact ? "md:col-span-1" : "md:col-span-2"}>
          <div className="flex items-center gap-5">
            <CompletionRing value={portalProject.completion} />
            <div className="space-y-2">
              <TechLabel>{portalProject.client}</TechLabel>
              <p className="text-[0.8rem] text-ash">
                {formatDate(new Date(portalProject.start), locale, { month: "short", year: "numeric" })} → {formatDate(new Date(portalProject.end), locale, { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </Card>

        <Card title={t("milestones")} className={compact ? "md:col-span-2" : "md:col-span-2"}>
          <ol className="relative space-y-3 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-[var(--line)]">
            {(compact ? milestones.slice(1, 5) : milestones).map((m) => (
              <li key={m.id} className="relative flex items-center gap-4 pl-6">
                <span className={cn("absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border", m.status === "done" ? "border-accent bg-accent" : m.status === "active" ? "border-pearl bg-obsidian" : "border-[var(--line-strong)] bg-obsidian")} />
                <span className={cn("flex-1 text-[0.85rem]", m.status === "planned" ? "text-ash" : "text-pearl")}>{m.title}</span>
                <span className="tech-label-sm hidden sm:block">{formatDate(new Date(m.date), locale, { day: "2-digit", month: "short" })}</span>
                <StatusPill status={m.status} />
              </li>
            ))}
          </ol>
        </Card>

        <Card title={t("analytics")} className={compact ? "md:col-span-1" : "md:col-span-2"}>
          <Sparkline data={analytics.visitors} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <span className="tech-label-sm block">{t("metrics.lcp")}</span>
              <span className="numeral text-xl">{analytics.lcp[analytics.lcp.length - 1].toFixed(1)}s</span>
            </div>
            <div>
              <span className="tech-label-sm block">{t("metrics.uptime")}</span>
              <span className="numeral text-xl">{analytics.uptime}%</span>
            </div>
            {!compact && (
              <>
                <div>
                  <span className="tech-label-sm block">{t("metrics.fps")}</span>
                  <span className="numeral text-xl">{analytics.fps}</span>
                </div>
                <div>
                  <span className="tech-label-sm block">{t("metrics.visitors")}</span>
                  <span className="numeral text-xl">{analytics.visitors[analytics.visitors.length - 1].toLocaleString(locale)}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {!compact && (
          <>
            <Card title={t("tasks")} className="md:col-span-3">
              <ul className="divide-y divide-[var(--line)]">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-4 py-2.5">
                    <span className={cn("h-3.5 w-3.5 rounded-sm border", task.status === "done" ? "border-accent bg-accent" : "border-[var(--line-strong)]")} />
                    <span className={cn("flex-1 text-[0.85rem]", task.status === "done" ? "text-ash line-through" : "text-pearl")}>{task.title}</span>
                    <span className="tech-label-sm">{task.estimate}</span>
                    <StatusPill status={task.status} />
                  </li>
                ))}
              </ul>
            </Card>

            <Card title={t("messages")} className="md:col-span-3">
              <ul className="space-y-3">
                {thread.map((m) => (
                  <li key={m.id} className={cn("flex gap-3", m.own && "flex-row-reverse text-right")}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] font-mono text-[0.6rem]">{m.initials}</span>
                    <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-[0.85rem]", m.own ? "bg-pearl text-obsidian" : "bg-white/[0.04] text-pearl")}>
                      <p>{m.body}</p>
                      <span className={cn("tech-label-sm mt-1 block", m.own && "text-obsidian/60")}>{m.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("reply")}
                  aria-label={t("reply")}
                  className="h-10 flex-1 rounded-full border border-[var(--line-strong)] bg-transparent px-4 text-[0.85rem] outline-none focus:border-accent"
                />
                <button type="submit" className="h-10 rounded-full bg-pearl px-4 text-[0.8rem] font-medium text-obsidian">
                  {t("sendMessage")}
                </button>
              </form>
            </Card>

            <Card title={t("files")} className="md:col-span-2">
              <ul className="divide-y divide-[var(--line)]">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between py-2.5 text-[0.85rem]">
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[0.6rem] text-ash">{f.type}</span>
                      <span>{f.name}</span>
                    </span>
                    <span className="tech-label-sm">{f.size}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title={t("invoices")} className="md:col-span-2">
              <ul className="divide-y divide-[var(--line)]">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 py-2.5 text-[0.85rem]">
                    <div>
                      <span className="block">{inv.label}</span>
                      <span className="tech-label-sm">{inv.id}</span>
                    </div>
                    <span className="numeral">{formatCurrency(inv.amount, locale)}</span>
                    <StatusPill status={inv.status} />
                  </li>
                ))}
              </ul>
            </Card>

            <Card title={t("meetings")} className="md:col-span-1">
              <ul className="space-y-3">
                {meetings.map((m) => (
                  <li key={m.id}>
                    <span className="block text-[0.85rem]">{m.title}</span>
                    <span className="tech-label-sm">
                      {formatDate(new Date(m.date), locale, { day: "2-digit", month: "short" })} · {m.time} · {m.duration}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title={t("activity")} className="md:col-span-1">
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id}>
                    <span className="tech-label-sm block">{a.time}</span>
                    <span className="text-[0.8rem] text-mist">{a.body}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
