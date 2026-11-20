import type { CSSProperties } from "react";

/** Delay for .intro / [data-reveal] animations, read by CSS as var(--d). */
export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Position in a staggered sequence (.line, .menu-item, .card-in), read by CSS as var(--i). */
export const stagger = (i: number) => ({ "--i": i }) as CSSProperties;
