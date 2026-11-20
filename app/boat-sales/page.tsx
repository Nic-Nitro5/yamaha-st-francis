import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Lines } from "../components/Lines";
import { ButtonLink, SectionLabel } from "../components/ui";
import StockBrowser, { StockGrid } from "./StockBrowser";
import { availableListings, categoryLabel, formatPrice, soldListings } from "../lib/listings";
import { CONTACTS, telHref, whatsappHref } from "../lib/site";
import { delay } from "../lib/motion";

export const metadata: Metadata = {
  title: "Boats for Sale",
  description:
    "New and pre-owned boats, Yamaha WaveRunners, jetboats and outboards for sale in St Francis Bay. Every listing inspected by our Yamaha-certified team.",
};

export default function BoatSalesPage() {
  const available = availableListings();
  const sold = soldListings();
  const { sales } = CONTACTS;

  return (
    <main id="top">
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="kenburns absolute inset-0">
          <Image
            src="/images/outboard.webp"
            alt=""
            fill
            preload
            sizes="(min-aspect-ratio: 16/9) 100vw, 180vh"
            className="object-cover object-[70%_50%] opacity-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/30" />
        <div className="gutter relative mx-auto max-w-7xl pb-16 pt-32 lg:pb-20 lg:pt-40">
          <p className="intro eyebrow text-white/80" style={delay(150)}>
            Boat sales <span className="mx-2 opacity-60">/</span> {available.length} listings available
          </p>
          <h1 className="intro-lines mt-5 text-[44px] font-bold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[84px]">
            <Lines lines={["Find your", "next boat."]} />
          </h1>
          <p className="intro mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-[17px]" style={delay(600)}>
            New and pre-owned boats, WaveRunners and jetboats, inspected and serviced by our Yamaha-certified team.
            Can&apos;t see what you&apos;re after? We source nationwide.
          </p>
          <div className="intro mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4" style={delay(750)}>
            <ButtonLink href="#stock">Browse stock</ButtonLink>
            <ButtonLink
              href={whatsappHref(sales.phone, `Hi ${sales.name.split(" ")[0]}, I'm looking for a boat. Can you help?`)}
              variant="outline"
            >
              WhatsApp our sales team
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* STOCK */}
      <section id="stock" className="gutter scroll-mt-16 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Reading ?type= needs the request, so the static page shows every listing until it is known. */}
          <Suspense fallback={<StockGrid listings={available} />}>
            <StockBrowser listings={available} />
          </Suspense>
        </div>
      </section>

      {/* SOURCING CTA */}
      <section className="gutter">
        <div
          data-reveal
          className="mx-auto grid max-w-7xl gap-8 bg-brand px-6 py-12 text-white sm:px-10 md:grid-cols-[1.4fr_1fr] md:items-center lg:px-14 lg:py-16"
        >
          <div>
            <p className="eyebrow text-white/75">High-end importing</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              Looking for something specific?
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/90">
              Tell us what you&apos;re dreaming of. We source new and pre-owned boats from trusted sellers nationwide,
              then rig it to your spec.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <ButtonLink href="/#contact" variant="navy">
              Send us your wishlist
            </ButtonLink>
            <a href={telHref(sales.phone)} className="link-line text-center text-sm text-white/90 md:text-right">
              or call {sales.phone}
            </a>
          </div>
        </div>
      </section>

      {/* RECENTLY SOLD */}
      {sold.length > 0 && (
        <section className="gutter py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>Recently sold</SectionLabel>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <h2 data-reveal="lines" className="text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
                <Lines lines={["Sold, and out", "on the water."]} />
              </h2>
              <p data-reveal className="max-w-sm text-sm leading-relaxed text-muted">
                Stock moves quickly. Ask us to let you know when something similar comes in.
              </p>
            </div>

            <ul className="no-scrollbar bleed mt-10 flex snap-x gap-4 overflow-x-auto pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
              {sold.map((l, i) => (
                <li key={l.slug} data-reveal style={delay((i % 6) * 70)} className="w-44 shrink-0 snap-start lg:w-auto">
                  <div className="relative aspect-square overflow-hidden bg-navy">
                    <Image
                      src={l.images[0]}
                      alt={l.title}
                      fill
                      sizes="(min-width: 1024px) 15vw, 176px"
                      className="object-cover grayscale-[60%]"
                    />
                    <span className="eyebrow absolute left-2 top-2 bg-navy px-2 py-1 text-[10px] text-white">Sold</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-ink">{l.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {categoryLabel(l.category)}
                    {l.price ? ` · ${formatPrice(l.price)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
