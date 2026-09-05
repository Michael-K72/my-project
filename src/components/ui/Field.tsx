"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  error?: string;
  hint?: string;
  optional?: string;
  className?: string;
};

const shell =
  "peer w-full bg-transparent border-b border-[var(--line-strong)] pt-6 pb-2.5 text-pearl placeholder-transparent outline-none transition-colors duration-300 focus:border-accent aria-[invalid=true]:border-red-300/70";
const floating =
  "pointer-events-none absolute left-0 top-6 text-mist transition-all duration-300 [transition-timing-function:var(--ease-out-expo)] peer-focus:top-0 peer-focus:text-[0.6875rem] peer-focus:tracking-[0.14em] peer-focus:uppercase peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.6875rem] peer-[:not(:placeholder-shown)]:tracking-[0.14em] peer-[:not(:placeholder-shown)]:uppercase";

function Meta({ id, error, hint, optional }: { id: string; error?: string; hint?: string; optional?: string }) {
  return (
    <div className="mt-2 flex min-h-4 items-start justify-between gap-4">
      <p id={`${id}-message`} className={cn("text-[0.75rem] leading-tight transition-colors", error ? "text-red-200" : "text-ash")} role={error ? "alert" : undefined}>
        {error ?? hint ?? ""}
      </p>
      {optional && <span className="tech-label-sm shrink-0">{optional}</span>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, BaseProps & InputHTMLAttributes<HTMLInputElement>>(function Input(
  { label, error, hint, optional, className, id: providedId, ...rest },
  ref,
) {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <div className={cn("relative", className)}>
      <input
        ref={ref}
        id={id}
        placeholder={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-message`}
        className={shell}
        {...rest}
      />
      <label htmlFor={id} className={floating}>
        {label}
      </label>
      <Meta id={id} error={error} hint={hint} optional={optional} />
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { label, error, hint, optional, className, id: providedId, ...rest },
  ref,
) {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={ref}
        id={id}
        placeholder={label}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-message`}
        className={cn(shell, "resize-none")}
        {...rest}
      />
      <label htmlFor={id} className={floating}>
        {label}
      </label>
      <Meta id={id} error={error} hint={hint} optional={optional} />
    </div>
  );
});

export const Select = forwardRef<HTMLSelectElement, BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }>(
  function Select({ label, error, hint, optional, className, id: providedId, children, ...rest }, ref) {
    const autoId = useId();
    const id = providedId ?? autoId;
    return (
      <div className={cn("relative", className)}>
        <label htmlFor={id} className="tech-label-sm absolute left-0 top-0">
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-message`}
          className={cn(shell, "appearance-none pr-8 [&>option]:bg-graphite")}
          {...rest}
        >
          {children}
        </select>
        <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute right-0 top-8 h-3 w-3 text-mist" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 4l4 4 4-4" />
        </svg>
        <Meta id={id} error={error} hint={hint} optional={optional} />
      </div>
    );
  },
);

/** Pill-style single/multi choice used by the configurator and booking. */
export function Choice({
  selected,
  onClick,
  children,
  className,
  index,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  index?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-full border px-4 py-2.5 text-left text-[0.9rem] transition-all duration-400 [transition-timing-function:var(--ease-out-expo)]",
        selected
          ? "border-pearl/70 bg-pearl text-obsidian"
          : "border-[var(--line-strong)] text-mist hover:border-pearl/40 hover:text-pearl",
        className,
      )}
    >
      {index && <span className={cn("font-mono text-[0.625rem] tracking-[0.12em]", selected ? "text-obsidian/60" : "text-ash")}>{index}</span>}
      <span>{children}</span>
      <span
        aria-hidden="true"
        className={cn("ml-auto h-1.5 w-1.5 rounded-full transition-all duration-400", selected ? "bg-obsidian" : "bg-transparent border border-[var(--line-strong)]")}
      />
    </button>
  );
}
