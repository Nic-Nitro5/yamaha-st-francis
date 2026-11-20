"use client";

import { useEffect, useRef, useState } from "react";

// One observer shared by every RevealObserver instance on the page.
let io: IntersectionObserver | null = null;
const watched = new WeakSet<Element>();

function sharedObserver() {
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.setAttribute("data-shown", "");
          io!.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  return io;
}

/**
 * Sets data-shown on each [data-reveal] element once it scrolls into view.
 *
 * It scans on mount, which is after React has hydrated the tree it sits in. The DOM
 * must not change before then, or React reports a hydration mismatch. Content
 * streamed in behind <Suspense> may hydrate later, so wrap it in an element with
 * `data-reveal-scope` and render <RevealObserver scoped /> inside it: page-level
 * observers skip scoped elements and leave them to the scoped one.
 */
export function RevealObserver({ scoped = false }: { scoped?: boolean }) {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])")].filter(
      (el) => scoped || !el.closest("[data-reveal-scope]"),
    );
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const obs = sharedObserver();
    const mine: Element[] = [];
    els.forEach((el) => {
      if (watched.has(el)) return;
      watched.add(el);
      mine.push(el);
      obs.observe(el);
    });
    return () =>
      mine.forEach((el) => {
        obs.unobserve(el);
        watched.delete(el);
      });
  }, [scoped]);
  return null;
}

/** Counts up from 0 to `to` when scrolled into view. */
export function CountUp({ to, duration = 1800 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - start) / duration, 1);
          setN(Math.round(to * (1 - Math.pow(1 - p, 4))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
    </span>
  );
}
