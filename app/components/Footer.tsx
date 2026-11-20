import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "./Arrow";
import { CopyrightYear } from "./CopyrightYear";

const hours = [
  ["Mon – Thu", "08:00 – 17:00"],
  ["Friday", "08:00 – 16:00"],
  ["Saturday", "08:30 – 12:00"],
  ["Sunday", "Closed"],
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function Footer() {
  return (
    <footer className="bg-navy px-5 pb-10 pt-16 text-white sm:px-6 lg:px-12 lg:pt-20">
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
              <Link href="/boat-sales" className="link-line hover:text-white">
                Boat sales
              </Link>
              <Link href="/#services" className="link-line hover:text-white">
                Services
              </Link>
              <Link href="/#contact" className="link-line hover:text-white">
                Contact
              </Link>
            </nav>
          </div>
          <div data-reveal style={d(80)}>
            <p className="eyebrow text-white/50">Visit</p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-white/85">
              Unit 1 Tarragona Road
              <br />
              Sea Vista, St Francis Bay
              <br />
              6312, South Africa
            </address>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=-34.17465336189,24.821991"
              className="group mt-4 inline-flex items-center gap-2 py-1 text-sm font-semibold text-[#ff6b6f]"
            >
              <span className="link-line">Get directions</span> <ArrowUpRight />
            </a>
          </div>
          <div data-reveal style={d(160)}>
            <p className="eyebrow text-white/50">Trading hours</p>
            <dl className="mt-4 max-w-60 space-y-1.5 text-sm">
              {hours.map(([day, h]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt className="text-white/60">{day}</dt>
                  <dd className="tabular-nums text-white/85">{h}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-reveal style={d(240)}>
            <p className="eyebrow text-white/50">Talk to us</p>
            <div className="mt-4 space-y-1 text-sm text-white/85">
              <a href="tel:+27829907225" className="block py-1 hover:text-white">
                +27 82 990 7225
              </a>
              <a href="mailto:richard@stfrancisyamaha.co.za" className="block break-all py-1 hover:text-white">
                richard@stfrancisyamaha.co.za
              </a>
              <a
                href="https://www.facebook.com/stfrancisyamaha"
                className="group mt-3 inline-flex items-center gap-2 py-1 font-semibold text-[#ff6b6f]"
              >
                <span className="link-line">Facebook</span> <ArrowUpRight />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>
            © <CopyrightYear /> St Francis Bay Yamaha. All rights reserved.
          </p>
          <a href="#top" className="group inline-flex items-center gap-2 hover:text-white">
            Back to top <ArrowUpRight className="-rotate-45" />
          </a>
        </div>
      </div>
    </footer>
  );
}
