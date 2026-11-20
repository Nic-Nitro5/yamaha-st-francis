import type { ReactNode } from "react";

type IconProps = { className?: string };

function Icon({
  className = "",
  viewBox = "0 0 12 12",
  filled = false,
  children,
}: IconProps & { viewBox?: string; filled?: boolean; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? undefined : "currentColor"}
      strokeWidth={filled ? undefined : 1.4}
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const arrowBase = "inline-block h-2.5 w-2.5 transition-transform duration-200";

/** The site's standard link arrow. Nudges up-right when its `.group` parent is hovered. */
export function ArrowUpRight({ className = "" }: IconProps) {
  return (
    <Icon className={`${arrowBase} group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${className}`}>
      <path d="M3 9 9 3M4 3h5v5" />
    </Icon>
  );
}

export function ArrowLeft({ className = "" }: IconProps) {
  return (
    <Icon className={`${arrowBase} group-hover:-translate-x-0.5 ${className}`}>
      <path d="M10 6H2.5M6 2.5 2.5 6 6 9.5" />
    </Icon>
  );
}

export function ArrowUp({ className = "" }: IconProps) {
  return (
    <Icon className={`${arrowBase} group-hover:-translate-y-0.5 ${className}`}>
      <path d="M6 10V2.5M2.5 6 6 2.5 9.5 6" />
    </Icon>
  );
}

export function Chevron({ dir, className = "h-4 w-4" }: IconProps & { dir: "left" | "right" }) {
  return (
    <Icon viewBox="0 0 16 16" className={className}>
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </Icon>
  );
}

export function CameraIcon({ className = "" }: IconProps) {
  return (
    <Icon viewBox="0 0 16 16" className={className}>
      <path d="M2 5.5h2.5L6 3.5h4l1.5 2H14v7H2z" />
      <circle cx="8" cy="9" r="2.2" />
    </Icon>
  );
}

export function PhoneIcon({ className = "" }: IconProps) {
  return (
    <Icon viewBox="0 0 16 16" className={className}>
      <path d="M3 2.5h2.5l1 3-1.5 1a8 8 0 0 0 4.5 4.5l1-1.5 3 1V13a1 1 0 0 1-1 1A11 11 0 0 1 2 3.5a1 1 0 0 1 1-1Z" />
    </Icon>
  );
}

export function WhatsAppIcon({ className = "" }: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" filled className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </Icon>
  );
}
