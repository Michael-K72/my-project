"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { clientFeatures } from "@/config/features";
import { useTransition as useRouteTransition } from "@/features/transition/store";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeMeta, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/preferences";
import { useUI } from "@/stores/ui";

type Command = {
  id: string;
  label: string;
  group: "navigate" | "actions" | "language";
  keywords: string;
  hint?: string;
  run: () => void;
};

export function CommandPalette() {
  const t = useTranslations("palette");
  const tErrors = useTranslations("errors");
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPaletteOpen);
  const toggle = useUI((s) => s.togglePalette);
  const setSurfaceOpen = useUI((s) => s.setSurfaceOpen);
  const setAppearanceOpen = useUI((s) => s.setAppearanceOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const toggleMotion = usePreferences((s) => s.toggleMotion);
  const toggleSound = usePreferences((s) => s.toggleSound);
  const motionPref = usePreferences((s) => s.motion);
  const sound = usePreferences((s) => s.sound);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale() as Locale;
  const begin = useRouteTransition((s) => s.begin);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && useUI.getState().paletteOpen) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      window.setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    if (href === pathname) return;
    begin("mask");
    window.setTimeout(() => router.push(href as never), 380);
  };

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "home", label: t("commands.home"), group: "navigate", keywords: "home index start", run: () => navigate("/") },
      { id: "configurator", label: t("commands.configurator"), group: "navigate", keywords: "configurator build estimate", run: () => navigate("/configurator") },
      { id: "store", label: t("commands.store"), group: "navigate", keywords: "store shop commerce cart checkout", run: () => navigate("/store") },
      { id: "book", label: t("commands.book"), group: "navigate", keywords: "book calendar appointment call", run: () => navigate("/book") },
      { id: "lab", label: t("commands.lab"), group: "navigate", keywords: "lab experiments shader particles", run: () => navigate("/lab") },
      { id: "network", label: t("commands.network"), group: "navigate", keywords: "network globe map world", run: () => navigate("/network") },
      { id: "portal", label: t("commands.portal"), group: "navigate", keywords: "portal dashboard client", run: () => navigate("/portal") },
      { id: "contact", label: t("commands.contact"), group: "navigate", keywords: "contact email message", run: () => navigate("/contact") },
    ];
    const actions: Command[] = [
      { id: "cart", label: t("commands.cart"), group: "actions", keywords: "cart basket", run: () => { setOpen(false); setCartOpen(true); } },
      { id: "surface", label: t("commands.surface"), group: "actions", keywords: "surface layers exploded", run: () => { setOpen(false); setSurfaceOpen(true); } },
      { id: "appearance", label: t("commands.appearance"), group: "actions", keywords: "appearance accent theme material", run: () => { setOpen(false); setAppearanceOpen(true); } },
      { id: "motion", label: t("commands.toggleMotion"), group: "actions", keywords: "motion reduce animation", hint: motionPref, run: () => { toggleMotion(); setOpen(false); } },
    ];
    if (clientFeatures.sound) {
      actions.push({ id: "sound", label: t("commands.toggleSound"), group: "actions", keywords: "sound audio", hint: sound ? "on" : "off", run: () => { toggleSound(); setOpen(false); } });
    }
    const langs: Command[] = locales
      .filter((l) => l !== locale)
      .map((l) => ({
        id: `lang-${l}`,
        label: localeMeta[l].native,
        group: "language",
        keywords: `${localeMeta[l].label} ${l} language sprache`,
        hint: localeMeta[l].short,
        run: () => {
          setOpen(false);
          // @ts-expect-error -- params forwarded for dynamic segments
          router.replace({ pathname, params }, { locale: l });
        },
      }));
    return [...nav, ...actions, ...langs];
    // navigate() closes over stable store setters; pathname/locale are the real deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, pathname, locale, motionPref, sound, params]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q));
  }, [commands, query]);

  useEffect(() => setIndex(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[index]?.run();
    }
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const groups: Array<Command["group"]> = ["navigate", "actions", "language"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpen(false)}
          data-lenis-prevent
        >
          <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-md" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("open")}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-5">
              <svg viewBox="0 0 16 16" className="h-4 w-4 text-ash" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5 14 14" />
              </svg>
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t("placeholder")}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
                className="h-14 flex-1 bg-transparent text-[0.95rem] text-pearl outline-none placeholder:text-ash"
              />
              <kbd className="tech-label-sm rounded border border-[var(--line-strong)] px-1.5 py-1">ESC</kbd>
            </div>
            <ul id="palette-list" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-4 py-8 text-center text-[0.9rem] text-ash">{tErrors("noResults", { query })}</li>}
              {groups.map((g) => {
                const items = filtered.filter((c) => c.group === g);
                if (items.length === 0) return null;
                return (
                  <li key={g} className="mb-1">
                    <span className="tech-label-sm block px-3 pb-1.5 pt-2">{t(`groups.${g}`)}</span>
                    <ul role="group">
                      {items.map((c) => {
                        const i = filtered.indexOf(c);
                        const active = i === index;
                        return (
                          <li
                            key={c.id}
                            id={`cmd-${c.id}`}
                            role="option"
                            aria-selected={active}
                            data-index={i}
                            onMouseEnter={() => setIndex(i)}
                            onClick={() => c.run()}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-[0.9rem] transition-colors",
                              active ? "bg-white/[0.07] text-pearl" : "text-mist",
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span className={cn("h-1 w-1 rounded-full", active ? "bg-accent" : "bg-transparent")} />
                              {c.label}
                            </span>
                            {c.hint && <span className="tech-label-sm">{c.hint}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-[var(--line)] px-5 py-2.5">
              <span className="tech-label-sm">{t("hint")}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
