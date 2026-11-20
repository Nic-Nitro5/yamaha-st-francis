import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "./icons";
import { TextLink } from "./ui";
import { CopyrightYear } from "./CopyrightYear";
import { ADDRESS, CONTACTS, HOURS, SITE, mailtoHref, telHref } from "../lib/site";
import { delay } from "../lib/motion";

const LINKS = [
  { href: "/boat-sales", label: "Boat sales" },
  { href: "/#services", label: "Services" },
  { href: "/#contact", label: "Contact" },
];

export default function Footer() {
  const { sales } = CONTACTS;
  return (
    <footer className="gutter bg-navy pb-10 pt-16 text-white lg:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:pb-16">
          <div data-reveal>
            <Link href="/" className="inline-block" aria-label="St Francis Yamaha, home">
              <Image
                src="/images/logo-on-dark.png"
                alt="Yamaha | St Francis"
                width={1401}
                height={194}
                sizes="230px"
                className="h-auto w-[230px]"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              Premium boats, Yamaha power and all things fast. Proudly St Francis Bay since 2019.
            </p>
            <nav aria-label="Footer" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="link-line hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div data-reveal style={delay(80)}>
            <p className="eyebrow text-white/50">Visit</p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-white/85">
              {ADDRESS.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <TextLink href={ADDRESS.mapUrl} tone="soft" className="mt-4 py-1">
              Get directions
            </TextLink>
          </div>

          <div data-reveal style={delay(160)}>
            <p className="eyebrow text-white/50">Trading hours</p>
            <dl className="mt-4 max-w-60 space-y-1.5 text-sm">
              {HOURS.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt className="text-white/60">{h.days}</dt>
                  <dd className="tabular-nums text-white/85">{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-reveal style={delay(240)}>
            <p className="eyebrow text-white/50">Talk to us</p>
            <div className="mt-4 space-y-1 text-sm text-white/85">
              <a href={telHref(sales.phone)} className="block py-1 hover:text-white">
                {sales.phone}
              </a>
              <a href={mailtoHref(sales.email)} className="block break-all py-1 hover:text-white">
                {sales.email}
              </a>
              <TextLink href={SITE.facebook} tone="soft" className="mt-3 py-1">
                Facebook
              </TextLink>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>
            © <CopyrightYear /> {SITE.name}. All rights reserved.
          </p>
          <a href="#top" className="group inline-flex items-center gap-2 hover:text-white">
            Back to top <ArrowUp />
          </a>
        </div>
      </div>
    </footer>
  );
}
