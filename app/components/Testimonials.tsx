"use client";

import { useEffect, useState } from "react";

const quotes = [
  {
    text: "Bought it from the best place in town! You will be looked after by Richard Fulford and his team.",
    name: "Richard Harpur",
  },
  {
    text: "Excellent service from Richard and his super team.",
    name: "Ben De Bruyn",
  },
  {
    text: "The best boat, and the most reliable motor, Yamaha has ever built.",
    name: "Leslie Boshoff",
  },
  {
    text: "The team looked after us all season long. Hands-on service from early morning until late afternoon.",
    name: "Kevin Robert Mac Innes",
  },
];

const INTERVAL = 7000;

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (d: number) => setI((p) => (p + d + quotes.length) % quotes.length);
  const q = quotes[i];
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((p) => (p + 1) % quotes.length), INTERVAL);
    return () => clearTimeout(t);
  }, [i, paused]);

  // Basic swipe support on touch screens.
  const [touchX, setTouchX] = useState<number | null>(null);

  return (
    <section
      className="px-5 py-20 sm:px-6 lg:px-12 lg:py-28"
      aria-label="Testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        setTouchX(null);
      }}
    >
      <div className="mx-auto max-w-7xl">
        <p data-reveal className="eyebrow text-muted">
          The St Francis Yamaha family
        </p>

        <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-[180px_1fr] md:gap-8">
          <span
            data-reveal
            aria-hidden="true"
            className="font-serif text-6xl font-bold leading-none text-brand md:text-7xl"
          >
            &ldquo;
          </span>
          <figure data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <div className="min-h-[7.5em] text-[24px] leading-snug sm:min-h-[5em] md:text-[34px]">
              <blockquote key={i} aria-live="polite" className="quote-in max-w-3xl font-medium text-ink">
                {q.text}
              </blockquote>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-6 md:mt-10">
              <figcaption key={q.name} className="quote-in eyebrow text-muted">
                {q.name}
              </figcaption>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="flex h-11 w-11 items-center justify-center border border-ink/15 text-ink transition-all duration-300 hover:-translate-x-0.5 hover:border-brand hover:text-brand"
                >
                  &larr;
                </button>
                <div className="w-16 text-center">
                  <span className="text-xs tabular-nums text-muted">
                    {pad(i + 1)} / {pad(quotes.length)}
                  </span>
                  <span className="mt-2 block h-px overflow-hidden bg-ink/10">
                    <span
                      key={`${i}-${paused}`}
                      className="block h-full origin-left bg-brand"
                      style={{
                        animation: paused ? "none" : `progress ${INTERVAL}ms linear forwards`,
                        transform: paused ? "scaleX(0)" : undefined,
                      }}
                    />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="flex h-11 w-11 items-center justify-center border border-ink/15 text-ink transition-all duration-300 hover:translate-x-0.5 hover:border-brand hover:text-brand"
                >
                  &rarr;
                </button>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
