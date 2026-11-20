import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "./icons";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/**
 * Client-side <Link> for routes in this app ("/..."), a plain <a> for same-page
 * anchors ("#..."), tel:, mailto: and external URLs.
 */
export function SmartLink({ href, ...rest }: AnchorProps) {
  return href.startsWith("/") ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}

const BUTTON_VARIANTS = {
  /** Red, sweeps to white. For dark backgrounds. */
  primary: "bg-brand text-white hover:text-brand",
  /** White outline, sweeps to white. For dark backgrounds. */
  outline: "border border-white/60 text-white hover:text-navy",
  /** Navy, sweeps to white. For red or light backgrounds. */
  navy: "bg-navy text-white hover:text-navy",
  /** Navy, sweeps to red. */
  navyToBrand: "bg-navy text-white [--sweep:var(--color-brand)]",
  /** Dark outline, sweeps to navy. For light backgrounds. */
  outlineDark: "border border-ink/15 text-ink [--sweep:var(--color-navy)] hover:text-white",
  whatsapp: "bg-whatsapp text-white [--sweep:var(--color-navy)]",
} as const;

const BUTTON_SIZES = {
  md: "gap-2.5 px-7 py-4 text-sm",
  sm: "gap-2 px-6 py-3.5 text-[13px]",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClass(variant: ButtonVariant = "primary", size: keyof typeof BUTTON_SIZES = "md") {
  return `btn-sweep group inline-flex items-center justify-center font-medium ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]}`;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon = <ArrowUpRight />,
  iconFirst = false,
  className = "",
  children,
  ...rest
}: AnchorProps & {
  variant?: ButtonVariant;
  size?: keyof typeof BUTTON_SIZES;
  icon?: ReactNode;
  iconFirst?: boolean;
}) {
  return (
    <SmartLink className={`${buttonClass(variant, size)} ${className}`} {...rest}>
      {iconFirst && icon}
      {children}
      {!iconFirst && icon}
    </SmartLink>
  );
}

/** Small uppercase label above a heading, e.g. "02 / Find your next adventure". Reveals on scroll. */
export function SectionLabel({ n, light = false, children }: { n?: string; light?: boolean; children: ReactNode }) {
  return (
    <p data-reveal className={`eyebrow flex items-center ${light ? "text-white/70" : "text-brand"}`}>
      {n && (
        <>
          {n} <span className="mx-2 opacity-60">/</span>
        </>
      )}
      {children}
    </p>
  );
}

const TEXT_TONES = {
  brand: "text-brand",
  /** Lighter red that keeps contrast on navy. */
  soft: "text-brand-soft",
  inherit: "",
} as const;

/** Bold text link with growing underline and arrow, e.g. "Meet the team ↗". */
export function TextLink({
  tone = "brand",
  icon = <ArrowUpRight />,
  iconFirst = false,
  className = "",
  children,
  ...rest
}: AnchorProps & { tone?: keyof typeof TEXT_TONES; icon?: ReactNode; iconFirst?: boolean }) {
  return (
    <SmartLink
      className={`group inline-flex items-center gap-2 text-sm font-semibold ${TEXT_TONES[tone]} ${className}`}
      {...rest}
    >
      {iconFirst && icon}
      <span className="link-line">{children}</span>
      {!iconFirst && icon}
    </SmartLink>
  );
}
