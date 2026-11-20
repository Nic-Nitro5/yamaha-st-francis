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

/** [data-reveal] elements in or under `node` that are not yet shown. */
function revealTargets(node: Element, includeScoped: boolean) {
  const found = node.matches("[data-reveal]") ? [node] : [];
  found.push(...node.querySelectorAll("[data-reveal]"));
  return found.filter((el) => !el.hasAttribute("data-shown") && (includeScoped || !el.closest("[data-reveal-scope]")));
}

/**
 * Sets data-shown on each [data-reveal] element once it scrolls into view.
 *
 * The root layout renders one. It scans after React has hydrated the page, then keeps
 * watching for elements React adds later (client-side navigation, filter changes).
 *
 * The DOM must not change before React hydrates it, or React reports a hydration
 * mismatch. Server HTML streamed in behind <Suspense> can hydrate after the layout,
 * so wrap such content in an element with `data-reveal-scope` and render
 * <RevealObserver scoped /> inside it: the layout's observer skips scoped elements
 * and the scoped one handles them once that boundary has hydrated.
 */
export function RevealObserver({ scoped = false }: { scoped?: boolean }) {
  useEffect(() => {
    const root = document.body;
    if (!("IntersectionObserver" in window)) {
      revealTargets(root, scoped).forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const obs = sharedObserver();
    const mine = new Set<Element>();
    const watch = (els: Element[]) =>
      els.forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        mine.add(el);
        obs.observe(el);
      });
    const unwatch = (els: Element[]) =>
      els.forEach((el) => {
        obs.unobserve(el);
        watched.delete(el);
        mine.delete(el);
      });

    watch(revealTargets(root, scoped));
    if (scoped) return () => unwatch([...mine]);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => n instanceof Element && watch(revealTargets(n, false)));
        r.removedNodes.forEach((n) => n instanceof Element && unwatch(revealTargets(n, true)));
      }
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      unwatch([...mine]);
    };
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
