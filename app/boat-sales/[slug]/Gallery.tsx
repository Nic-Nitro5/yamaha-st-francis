"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const n = images.length;

  const go = useCallback((d: number) => setI((p) => (p + d + n) % n), [n]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    const el = thumbs.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [i]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  const navBtn =
    "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-ink shadow-sm transition-all duration-300 hover:bg-white hover:scale-105";

  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden bg-navy" {...swipe}>
        {/* Blurred fill behind portrait or odd-sized photos so nothing is cropped */}
        <Image
          src={images[i]}
          alt=""
          fill
          sizes="10vw"
          loading="eager"
          aria-hidden
          className="scale-110 object-cover opacity-40 blur-2xl"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label={`View photo ${i + 1} of ${n} full screen`}
        >
          <Image
            key={images[i]}
            src={images[i]}
            alt={`${title}, photo ${i + 1} of ${n}`}
            fill
            preload={i === 0}
            loading="eager"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="img-in object-contain"
          />
        </button>
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${navBtn} left-3`}>
              <Chevron dir="left" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${navBtn} right-3`}>
              <Chevron dir="right" />
            </button>
          </>
        )}
        <span className="pointer-events-none absolute bottom-3 left-3 bg-navy/80 px-2.5 py-1 text-xs tabular-nums text-white">
          {i + 1} / {n}
        </span>
      </div>

      {n > 1 && (
        <div ref={thumbs} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show photo ${k + 1}`}
              aria-current={k === i}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden transition-all duration-300 sm:w-24 ${
                k === i ? "ring-2 ring-brand ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" loading={k < 5 ? "eager" : "lazy"} className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          className="fade-in fixed inset-0 z-[100] flex flex-col bg-navy/97 backdrop-blur"
          {...swipe}
        >
          <div className="flex items-center justify-between px-5 py-4 text-white sm:px-8">
            <span className="text-sm tabular-nums text-white/70">
              {i + 1} / {n}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center gap-2 px-2 text-sm"
              aria-label="Close full screen photos"
              autoFocus
            >
              Close <span aria-hidden className="text-xl leading-none">×</span>
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              key={images[i]}
              src={images[i]}
              alt={`${title}, photo ${i + 1} of ${n}`}
              fill
              sizes="100vw"
              className="img-in object-contain"
            />
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${navBtn} left-3 sm:left-6`}>
                  <Chevron dir="left" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${navBtn} right-3 sm:right-6`}>
                  <Chevron dir="right" />
                </button>
              </>
            )}
          </div>
          <div className="h-6 sm:h-10" />
        </div>
      )}
    </div>
  );
}
