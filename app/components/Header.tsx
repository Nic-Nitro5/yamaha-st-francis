"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "./icons";
import { ButtonLink } from "./ui";
import { CONTACTS, telHref } from "../lib/site";
import { delay, stagger } from "../lib/motion";

const NAV = [
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
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Hide while scrolling down, reveal on any scroll up.
      if (y > 240 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile menu is open: lock page scroll, close on Escape or on resize to desktop.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onResize = () => window.innerWidth >= 1024 && close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const barHeight = scrolled ? "h-16 lg:h-[72px]" : "h-[72px] lg:h-20";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled || open
          ? "bg-navy/95 shadow-[0_1px_0_rgba(255,255,255,.06)] backdrop-blur-md"
          : "bg-gradient-to-b from-navy/70 to-transparent"
      }`}
    >
      <div className={`gutter mx-auto flex max-w-7xl items-center justify-between transition-[height] duration-500 ${barHeight}`}>
        <Link href="/" className="intro block shrink-0" aria-label="St Francis Yamaha, home" onClick={close}>
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
          {NAV.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              style={delay(150 + i * 60)}
              className={`intro link-line text-[13px] transition-colors hover:text-white ${
                isActive(l.href) ? "bg-[length:100%_1px] text-white" : "text-white/85"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <ButtonLink href="/#contact" size="sm" style={delay(500)} className="intro max-lg:hidden">
          Get in touch
        </ButtonLink>

        <button
          type="button"
          className="relative -mr-2 h-11 w-11 text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {[
            open ? "top-1/2 rotate-45" : "top-[16px]",
            open ? "top-1/2 opacity-0" : "top-1/2",
            open ? "top-1/2 -rotate-45" : "top-[27px]",
          ].map((pos, k) => (
            <span key={k} className={`absolute left-2.5 right-2.5 h-px bg-current transition-all duration-300 ${pos}`} />
          ))}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className={`gutter flex ${
            scrolled ? "h-[calc(100svh-64px)]" : "h-[calc(100svh-72px)]"
          } flex-col overflow-y-auto border-t border-white/10 pb-10 pt-6 lg:hidden`}
        >
          {NAV.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={close}
              style={stagger(i)}
              className="menu-item flex items-center justify-between border-b border-white/10 py-5 text-[28px] font-semibold tracking-tight text-white"
            >
              {l.label}
              <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
            </Link>
          ))}
          <div className="menu-item mt-auto pt-10" style={stagger(NAV.length)}>
            <ButtonLink href="/#contact" onClick={close} className="w-full">
              Get in touch
            </ButtonLink>
            <a href={telHref(CONTACTS.sales.phone)} className="mt-5 block text-center text-sm text-white/70">
              Call {CONTACTS.sales.phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
