import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RevealObserver } from "../../components/Motion";
import { ArrowLeft, PhoneIcon, WhatsAppIcon } from "../../components/icons";
import { ButtonLink, TextLink } from "../../components/ui";
import Gallery from "./Gallery";
import ListingCard from "../ListingCard";
import { availableListings, categoryLabel, formatPrice, getListing, relatedListings, type Listing } from "../../lib/listings";
import { ADDRESS, CONTACTS, hoursSummary, mailtoHref, telHref, whatsappHref } from "../../lib/site";
import { delay } from "../../lib/motion";

export function generateStaticParams() {
  return availableListings().map((l) => ({ slug: l.slug }));
}

const firstParagraph = (l: Listing) => l.description.find((b) => b.type === "p")?.text ?? "";

export async function generateMetadata({ params }: PageProps<"/boat-sales/[slug]">): Promise<Metadata> {
  const l = getListing((await params).slug);
  if (!l) return {};
  return {
    title: `${l.title} for sale`,
    description: `${formatPrice(l.price)}. ${firstParagraph(l).slice(0, 140)}`.trim(),
    openGraph: { images: [l.images[0]] },
  };
}

/**
 * Header and footer come from the root layout. Everything that depends on the slug
 * sits behind Suspense, so navigating here from the stock list shows the skeleton
 * straight away.
 */
export default function ListingPage({ params }: PageProps<"/boat-sales/[slug]">) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <ListingContent params={params} />
    </Suspense>
  );
}

const TITLE_BAND = "gutter mx-auto max-w-7xl pb-10 pt-28 lg:pb-14 lg:pt-36";
const BODY_GRID = "mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14";

function ListingSkeleton() {
  const pulse = "animate-pulse bg-current opacity-10";
  return (
    <main id="top" aria-busy="true" aria-label="Loading listing">
      <section className="bg-navy text-white">
        <div className={TITLE_BAND}>
          <div className={`h-3 w-56 ${pulse}`} />
          <div className={`mt-6 h-10 w-3/4 max-w-xl sm:h-14 ${pulse}`} />
          <div className={`mt-6 h-8 w-40 lg:-mt-10 lg:ml-auto ${pulse}`} />
        </div>
      </section>
      <section className="gutter py-10 text-ink lg:py-16">
        <div className={BODY_GRID}>
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

  const { sales, finance } = CONTACTS;
  const firstName = sales.name.split(" ")[0];
  const message = `Hi ${firstName}, I'm interested in the ${l.title} (${formatPrice(l.price)}) listed on your website.`;
  const whatsapp = whatsappHref(sales.phone, message);
  const related = relatedListings(l);

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
          <div className={TITLE_BAND}>
            <nav aria-label="Breadcrumb" className="intro eyebrow flex flex-wrap items-center gap-2 text-white/60" style={delay(100)}>
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
                style={delay(200)}
              >
                {l.title}
              </h1>
              <div className="intro shrink-0 lg:text-right" style={delay(350)}>
                {l.wasPrice && l.price && (
                  <p className="text-sm text-white/60">
                    Was <s className="tabular-nums">{formatPrice(l.wasPrice)}</s>
                    <span className="eyebrow ml-3 bg-brand px-2 py-1 text-[10px] text-white">
                      Save {formatPrice(l.wasPrice - l.price)}
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
        <section className="gutter py-10 lg:py-16">
          <div className={BODY_GRID}>
            <div className="min-w-0">
              {/* Keyed so the photo index resets when moving between listings */}
              <Gallery key={l.slug} images={l.images} title={l.title} />

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
                          {b.items.map((it, j) => (
                            <li key={j} className="flex gap-3">
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
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">Talk to {firstName}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Book a viewing at our Sea Vista showroom, ask for more photos, or talk finance and trade-ins.
                </p>
                <div className="mt-7 grid gap-3">
                  <ButtonLink href={whatsapp} variant="whatsapp" iconFirst icon={<WhatsAppIcon className="h-4 w-4" />}>
                    WhatsApp about this listing
                  </ButtonLink>
                  <ButtonLink href={telHref(sales.phone)} variant="navyToBrand" iconFirst icon={<PhoneIcon className="h-4 w-4" />}>
                    Call {sales.phone}
                  </ButtonLink>
                  <ButtonLink
                    href={mailtoHref(sales.email, { subject: `Enquiry: ${l.title}`, body: `${message}\n\n` })}
                    variant="outlineDark"
                  >
                    Email an enquiry
                  </ButtonLink>
                </div>
                <div className="mt-7 border-t border-ink/10 pt-6 text-sm leading-relaxed text-muted">
                  <p>
                    <span className="font-medium text-ink">Finance available.</span> {finance.name} in our finance team
                    can help structure a deal.{" "}
                    <a href={telHref(finance.phone)} className="link-line text-brand">
                      {finance.phone}
                    </a>
                  </p>
                  <p className="mt-3">
                    <span className="font-medium text-ink">Viewings:</span> {ADDRESS.short}. {hoursSummary}.
                  </p>
                </div>
              </div>
              <TextLink href="/boat-sales" iconFirst icon={<ArrowLeft />} className="mt-6 hidden lg:inline-flex">
                Back to all stock
              </TextLink>
            </aside>
          </div>
        </section>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="gutter border-t border-ink/10 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 data-reveal className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
                  You might also like
                </h2>
                <TextLink data-reveal href="/boat-sales">
                  View all stock
                </TextLink>
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

      {/* Phone: always-visible enquiry bar. The footer makes room for it (see globals.css). */}
      <div
        data-mobile-bar
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-white/10 bg-navy/95 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        <a href={whatsapp} className="flex items-center justify-center gap-2 bg-whatsapp py-3.5 text-sm font-medium text-white">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp
        </a>
        <a href={telHref(sales.phone)} className="flex items-center justify-center gap-2 bg-brand py-3.5 text-sm font-medium text-white">
          <PhoneIcon className="h-4 w-4" /> Call
        </a>
      </div>
    </div>
  );
}
