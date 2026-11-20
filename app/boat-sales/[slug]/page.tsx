import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArrowUpRight } from "../../components/Arrow";
import { RevealObserver } from "../../components/Motion";
import Gallery from "./Gallery";
import ListingCard from "../ListingCard";
import {
  availableListings,
  categoryLabel,
  formatPrice,
  getListing,
  relatedListings,
  SALES_CONTACT,
} from "../../lib/listings";

export function generateStaticParams() {
  return availableListings().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/boat-sales/[slug]">): Promise<Metadata> {
  const l = getListing((await params).slug);
  if (!l) return {};
  const summary = l.description.find((b) => b.type === "p");
  return {
    title: `${l.title} | Boats for Sale | St Francis Bay Yamaha`,
    description: `${formatPrice(l.price)}. ${summary?.type === "p" ? summary.text.slice(0, 140) : ""}`.trim(),
    openGraph: { images: [l.images[0]] },
  };
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" className={className}>
      <path d="M3 2.5h2.5l1 3-1.5 1a8 8 0 0 0 4.5 4.5l1-1.5 3 1V13a1 1 0 0 1-1 1A11 11 0 0 1 2 3.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

/**
 * Header and footer are shared by every listing, so they live in the App Shell.
 * Everything that depends on the slug sits behind Suspense, letting navigation
 * from the stock list paint the frame and skeleton instantly.
 */
export default function ListingPage({ params }: PageProps<"/boat-sales/[slug]">) {
  return (
    <>
      <RevealObserver />
      <Header />
      <Suspense fallback={<ListingSkeleton />}>
        <ListingContent params={params} />
      </Suspense>
      <Footer />
      {/* Room for the phone enquiry bar so it never covers the footer */}
      <div className="h-[76px] bg-navy lg:hidden" aria-hidden />
    </>
  );
}

function ListingSkeleton() {
  const pulse = "animate-pulse bg-current opacity-10";
  return (
    <main id="top" aria-busy="true" aria-label="Loading listing">
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-6 lg:px-12 lg:pb-14 lg:pt-36">
          <div className={`h-3 w-56 ${pulse}`} />
          <div className={`mt-6 h-10 w-3/4 max-w-xl sm:h-14 ${pulse}`} />
          <div className={`mt-6 h-8 w-40 lg:ml-auto lg:-mt-10 ${pulse}`} />
        </div>
      </section>
      <section className="px-5 py-10 text-ink sm:px-6 lg:px-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
          <div className={`aspect-[4/3] ${pulse}`} />
          <div className={`hidden h-[420px] lg:block ${pulse}`} />
        </div>
      </section>
    </main>
  );
}

async function ListingContent({ params }: Pick<PageProps<"/boat-sales/[slug]">, "params">) {
  const l = getListing((await params).slug);
  if (!l) notFound();

  const related = relatedListings(l);
  const message = `Hi Richard, I'm interested in the ${l.title} (${formatPrice(l.price)}) listed on your website.`;
  const whatsapp = `https://wa.me/${SALES_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
  const mailto = `mailto:${SALES_CONTACT.email}?subject=${encodeURIComponent(`Enquiry: ${l.title}`)}&body=${encodeURIComponent(
    message + "\n\n",
  )}`;

  const facts = [
    ["Type", categoryLabel(l.category)],
    ["Year", l.year ? String(l.year) : "See description"],
    ["Photos", String(l.images.length)],
    ["Location", "St Francis Bay"],
  ];

  return (
    // Streamed section: its own observer runs once it has hydrated (see RevealObserver).
    <div data-reveal-scope>
      <RevealObserver scoped />
      <main id="top">
        {/* TITLE BAND */}
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-6 lg:px-12 lg:pb-14 lg:pt-36">
            <nav aria-label="Breadcrumb" className="intro eyebrow flex flex-wrap items-center gap-2 text-white/60" style={{ "--d": "100ms" } as React.CSSProperties}>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span aria-hidden>/</span>
              <Link href="/boat-sales" className="hover:text-white">
                Boat sales
              </Link>
              <span aria-hidden>/</span>
              <span className="text-white/90">{categoryLabel(l.category)}</span>
            </nav>
            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <h1
                className="intro max-w-3xl text-[32px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[56px]"
                style={{ "--d": "200ms" } as React.CSSProperties}
              >
                {l.title}
              </h1>
              <div className="intro shrink-0 lg:text-right" style={{ "--d": "350ms" } as React.CSSProperties}>
                {l.wasPrice && (
                  <p className="text-sm text-white/60">
                    Was <s className="tabular-nums">{formatPrice(l.wasPrice)}</s>
                    <span className="eyebrow ml-3 bg-brand px-2 py-1 text-[10px] text-white">
                      Save {formatPrice(l.wasPrice - (l.price ?? 0))}
                    </span>
                  </p>
                )}
                <p className={`mt-1 font-semibold tabular-nums ${l.price ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
                  {formatPrice(l.price)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BODY */}
        <section className="px-5 py-10 sm:px-6 lg:px-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <Gallery images={l.images} title={l.title} />

              <dl data-reveal className="mt-10 grid grid-cols-2 border-t border-ink/10 sm:grid-cols-4">
                {facts.map(([k, v]) => (
                  <div key={k} className="border-b border-ink/10 py-4 pr-4">
                    <dt className="eyebrow text-muted">{k}</dt>
                    <dd className="mt-1.5 font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              {l.description.length > 0 && (
                <div className="mt-10">
                  <h2 data-reveal className="eyebrow text-brand">
                    About this listing
                  </h2>
                  <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-ink/85">
                    {l.description.map((b, k) =>
                      b.type === "p" ? (
                        <p key={k} data-reveal>
                          {b.text}
                        </p>
                      ) : (
                        <ul key={k} data-reveal className="grid gap-x-8 gap-y-2.5 py-2 sm:grid-cols-2">
                          {b.items.map((it) => (
                            <li key={it} className="flex gap-3">
                              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" aria-hidden />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ENQUIRY PANEL */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div data-reveal className="bg-white p-6 shadow-[0_1px_0_rgba(15,29,46,.06),0_20px_50px_-30px_rgba(15,29,46,.35)] sm:p-8">
                <p className="eyebrow text-brand">Interested?</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">Talk to {SALES_CONTACT.name.split(" ")[0]}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Book a viewing at our Sea Vista showroom, ask for more photos, or talk finance and trade-ins.
                </p>
                <div className="mt-7 grid gap-3">
                  <a
                    href={whatsapp}
                    className="btn-sweep group flex items-center justify-center gap-2.5 bg-[#1fa855] px-6 py-4 text-sm font-medium text-white [--sweep:#0b1a2c]"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp about this listing
                  </a>
                  <a
                    href={`tel:${SALES_CONTACT.tel}`}
                    className="btn-sweep group flex items-center justify-center gap-2.5 bg-navy px-6 py-4 text-sm font-medium text-white [--sweep:#d42a30]"
                  >
                    <PhoneIcon className="h-4 w-4" /> Call {SALES_CONTACT.phone}
                  </a>
                  <a
                    href={mailto}
                    className="btn-sweep group flex items-center justify-center gap-2.5 border border-ink/15 px-6 py-4 text-sm font-medium text-ink [--sweep:#0b1a2c] hover:text-white"
                  >
                    Email an enquiry <ArrowUpRight />
                  </a>
                </div>
                <div className="mt-7 border-t border-ink/10 pt-6 text-sm leading-relaxed text-muted">
                  <p>
                    <span className="font-medium text-ink">Finance available.</span> Laura Robson in our finance team can
                    help structure a deal.{" "}
                    <a href="tel:+27843837098" className="link-line text-brand">
                      +27 84 383 7098
                    </a>
                  </p>
                  <p className="mt-3">
                    <span className="font-medium text-ink">Viewings:</span> Unit 1 Tarragona Road, Sea Vista. Mon–Thu
                    8–5, Fri 8–4, Sat 8:30–12.
                  </p>
                </div>
              </div>
              <Link
                href="/boat-sales"
                className="group mt-6 hidden items-center gap-2 text-sm font-semibold text-brand lg:inline-flex"
              >
                <span className="rotate-180">
                  <ArrowUpRight className="rotate-45" />
                </span>
                <span className="link-line">Back to all stock</span>
              </Link>
            </aside>
          </div>
        </section>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="border-t border-ink/10 px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 data-reveal className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
                  You might also like
                </h2>
                <Link data-reveal href="/boat-sales" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  <span className="link-line">View all stock</span> <ArrowUpRight />
                </Link>
              </div>
              <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r, i) => (
                  <ListingCard key={r.slug} listing={r} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Phone: always-visible enquiry bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-px border-t border-white/10 bg-navy/95 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <a href={whatsapp} className="flex items-center justify-center gap-2 bg-[#1fa855] py-3.5 text-sm font-medium text-white">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp
        </a>
        <a href={`tel:${SALES_CONTACT.tel}`} className="ml-2 flex items-center justify-center gap-2 bg-brand py-3.5 text-sm font-medium text-white">
          <PhoneIcon className="h-4 w-4" /> Call
        </a>
      </div>

    </div>
  );
}
