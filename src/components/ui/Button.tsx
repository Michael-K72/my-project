"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { TransitionLink as Link } from "@/features/transition/TransitionLink";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type Variant = "primary" | "ghost" | "accent" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-3 rounded-full font-medium tracking-tight transition-[transform,background-color,border-color,color] duration-500 [transition-timing-function:var(--ease-out-expo)] focus-visible:outline-1 focus-visible:outline-accent disabled:opacity-40 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-pearl text-obsidian hover:bg-ivory active:scale-[0.98]",
  ghost: "text-pearl border border-[var(--line-strong)] hover:border-pearl/60 hover:bg-white/[0.04] active:scale-[0.98]",
  accent: "bg-accent text-obsidian hover:brightness-110 active:scale-[0.98]",
  link: "text-pearl underline-slide rounded-none px-0 py-0 gap-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & { href: string; target?: string; rel?: string; onClick?: () => void; "aria-label"?: string };

function Arrow() {
  return (
    <span aria-hidden="true" className="relative h-3 w-3 overflow-hidden">
      <svg
        viewBox="0 0 12 12"
        className="absolute inset-0 h-3 w-3 transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-3 group-hover:-translate-y-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M2 10L10 2M4 2h6v6" />
      </svg>
      <svg
        viewBox="0 0 12 12"
        className="absolute inset-0 h-3 w-3 -translate-x-3 translate-y-3 transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M2 10L10 2M4 2h6v6" />
      </svg>
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkProps>(function Button(props, ref) {
  const { variant = "primary", size = "md", magnetic = variant !== "link", icon, className, children, ...rest } = props;
  const classes = cn(base, variants[variant], variant === "link" ? "" : sizes[size], className);
  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {icon === undefined ? <Arrow /> : icon}
    </>
  );

  let node: ReactNode;
  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as LinkProps;
    node = (
      <Link href={href} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  } else {
    node = (
      <button ref={ref} className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    );
  }

  return magnetic ? <Magnetic strength={10}>{node}</Magnetic> : node;
});
