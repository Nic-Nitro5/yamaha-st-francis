"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "./Arrow";

const links = [
  { href: "/boat-sales", label: "Boat sales" },
  { href: "/boat-sales?type=waverunners", label: "WaveRunners" },
  { href: "/#range", label: "Outboards" },
  { href: "/#services", label: "Our services" },
  { href: "/#about", label: "About us" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();
  const isActive = (href: string) => href === "/boat-sales" && pathname.startsWith("/boat-sales");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Hide while scrolling down, reveal on any scroll up.
      setHidden(y > 240 && y > lastY.current + 4 ? true : y < lastY.current - 4 ? false : (h) => h);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll + close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${scrolled || open ? "bg-navy/95 shadow-[0_1px_0_rgba(255,255,255,.06)] backdrop-blur-md" : "bg-gradient-to-b from-navy/70 to-transparent"}`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-[height] duration-500 sm:px-6 lg:px-12 ${
          scrolled ? "h-16 lg:h-[72px]" : "h-[72px] lg:h-20"
        }`}
      >
        <Link href="/" className="intro block shrink-0" aria-label="St Francis Yamaha, home" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo-on-dark.png"
            alt="Yamaha | St Francis"
            width={1401}
            height={194}
            preload
            sizes="(min-width: 1024px) 240px, 180px"
            className={`h-auto transition-[width] duration-500 ${scrolled ? "w-[160px] lg:w-[210px]" : "w-[180px] lg:w-[240px]"}`}
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {links.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              style={{ "--d": `${150 + i * 60}ms` } as React.CSSProperties}
              className={`intro link-line text-[13px] transition-colors hover:text-white ${
                isActive(l.href) ? "bg-[length:100%_1px] text-white" : "text-white/85"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#contact"
          style={{ "--d": "500ms" } as React.CSSProperties}
          className="intro btn-sweep group hidden items-center gap-2 bg-brand px-6 py-3.5 text-[13px] font-medium text-white hover:text-brand lg:inline-flex"
        >
          Get in touch <ArrowUpRight />
        </Link>

        <button
          type="button"
          className="relative -mr-2 h-11 w-11 text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={`absolute left-2.5 right-2.5 h-px bg-current transition-all duration-300 ${
              open ? "top-1/2 rotate-45" : "top-[16px]"
            }`}
          />
          <span
            className={`absolute left-2.5 right-2.5 top-1/2 h-px bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-2.5 right-2.5 h-px bg-current transition-all duration-300 ${
              open ? "top-1/2 -rotate-45" : "top-[27px]"
            }`}
          />
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className={`flex ${scrolled ? "h-[calc(100svh-64px)]" : "h-[calc(100svh-72px)]"} flex-col overflow-y-auto border-t border-white/10 px-5 pb-10 pt-6 sm:px-6 lg:hidden`}
        >
          {links.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ "--i": i } as React.CSSProperties}
              className="menu-item flex items-center justify-between border-b border-white/10 py-5 text-[28px] font-semibold tracking-tight text-white"
            >
              {l.label}
              <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
            </Link>
          ))}
          <div className="menu-item mt-auto pt-10" style={{ "--i": links.length } as React.CSSProperties}>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="group flex w-full items-center justify-center gap-2 bg-brand px-6 py-4 text-sm font-medium text-white"
            >
              Get in touch <ArrowUpRight />
            </Link>
            <a href="tel:+27829907225" className="mt-5 block text-center text-sm text-white/70">
              Call +27 82 990 7225
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
