import Image from "next/image";
import Link from "next/link";
import Testimonials from "./components/Testimonials";
import ContactForm from "./components/ContactForm";
import { ArrowUpRight } from "./components/icons";
import { CountUp } from "./components/Motion";
import { Lines } from "./components/Lines";
import { ButtonLink, SectionLabel, TextLink } from "./components/ui";
import { ADDRESS, CONTACTS, mailtoHref, telHref } from "./lib/site";
import { delay } from "./lib/motion";

const RANGE = [
  {
    n: "01",
    title: "Boats",
    copy: "Find your freedom. From the canals to the open ocean, new and pre-owned.",
    cta: "Explore boats",
    href: "/boat-sales?type=boats",
    img: "/images/mystique.jpg",
    alt: "A blue and white Mystique 212 sports boat in the St Francis Yamaha showroom",
    pos: "object-[30%_50%]",
  },
  {
    n: "02",
    title: "Yamaha outboards",
    copy: "Legendary reliability. Uncompromising performance. Fitted by certified technicians.",
    cta: "Discover outboards",
    href: "/#services",
    img: "/images/propulsion.webp",
    alt: "A Yamaha 90hp four-stroke outboard powering through the water",
    pos: "object-center",
  },
  {
    n: "03",
    title: "WaveRunners",
    copy: "Pure exhilaration. Make every moment on the water count.",
    cta: "Explore WaveRunners",
    href: "/boat-sales?type=waverunners",
    img: "/images/waverunner.webp",
    alt: "A blue and white Yamaha WaveRunner in the St Francis Yamaha showroom",
    pos: "object-[50%_45%]",
  },
];

const SERVICES = [
  { title: "Yamaha servicing & repairs", copy: "Three Yamaha-certified technicians. Care without compromise." },
  { title: "Custom rigging & electronics", copy: "Rigs built to your spec, including Helm Master EX, Garmin and Simrad." },
  { title: "Fabrication & marine care", copy: "Trailers built to order, on-site stainless steel, pontoon and SUP repairs." },
  { title: "Storage, docking & aftercare", copy: "Stored, docked, cleaned and flushed. Peace of mind, on and off the water." },
];

const TICKER = [
  "Yamaha marine specialists",
  "Sales, service & custom rigging",
  "Local knowledge. Open-ocean ambition.",
  "Yamaha-certified technicians",
  "Helm Master EX installations",
];

const TEAM = [CONTACTS.sales, CONTACTS.finance];

const H2 = "text-[40px] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-[64px]";

export default function Home() {
  return (
    <main id="top">
      {/* HERO */}
      <section className="relative flex min-h-svh flex-col overflow-hidden bg-navy text-white lg:max-h-[960px] lg:min-h-[680px]">
        <div className="kenburns absolute inset-0">
          <Image
            src="/images/hero.webp"
            alt="A Yamaha 255XD wake boat on the water with friends aboard"
            fill
            preload
            // Cover-cropped 16:9 photo: on tall/narrow screens it renders ~1.8x the viewport height wide.
            sizes="(min-aspect-ratio: 16/9) 100vw, 180vh"
            className="object-cover object-[72%_50%] lg:object-[65%_50%]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/30 lg:bg-gradient-to-r lg:from-navy lg:via-navy/75 lg:to-navy/10" />
        <div className="absolute inset-0 hidden bg-gradient-to-t from-navy/80 via-transparent to-transparent lg:block" />

        <div className="gutter relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end pb-8 pt-28 lg:justify-center lg:pb-10">
          <p className="intro eyebrow text-white/85" style={delay(150)}>
            Ocean-ready. &nbsp;Yamaha-powered.
          </p>
          <h1 className="intro-lines mt-5 text-[52px] font-bold leading-[0.95] tracking-[-0.035em] min-[400px]:text-[60px] sm:mt-6 sm:text-7xl lg:text-[104px]">
            <Lines lines={["Beyond the", "shoreline."]} />
          </h1>
          <p className="intro mt-6 max-w-md text-base leading-relaxed text-white/90 sm:mt-8 sm:text-[17px]" style={delay(650)}>
            Exceptional boats. Proven performance.
            <br className="hidden sm:block" /> Your next chapter on the water starts here.
          </p>
          <div className="intro mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4" style={delay(800)}>
            <ButtonLink href="#range">Explore our boats</ButtonLink>
            <ButtonLink href="#services" variant="outline">
              Discover our services
            </ButtonLink>
          </div>

          <div className="intro mt-12 flex items-end justify-between gap-6 lg:mt-16" style={delay(1000)}>
            <p className="eyebrow flex items-center gap-4 text-white/85">
              <span className="h-px w-7 bg-brand" />
              St Francis Bay, South Africa
            </p>
            <a href="#about" className="eyebrow hidden items-center gap-3 text-white/80 hover:text-white sm:flex">
              Scroll to explore
              <span className="relative block h-8 w-px overflow-hidden bg-white/20">
                <span className="scroll-cue absolute inset-0 bg-white" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* RED TICKER: two identical copies scroll as one seamless loop */}
      <div className="overflow-hidden bg-brand text-white">
        <div className="marquee flex w-max">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-label={copy === 0 ? "What we do" : undefined}
              aria-hidden={copy === 1 || undefined}
              className="flex shrink-0"
            >
              {[...TICKER, ...TICKER].map((t, i) => (
                <li key={i} className="eyebrow flex items-center gap-10 whitespace-nowrap py-6 pl-10 sm:py-7">
                  {t}
                  <span className="h-1.5 w-1.5 rotate-45 bg-white/60" aria-hidden />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* 01 WELCOME */}
      <section id="about" className="gutter scroll-mt-20 pt-20 lg:pt-28">
        <div className="mx-auto max-w-7xl border-b border-ink/10 pb-20 lg:pb-24">
          <SectionLabel n="01">Welcome to St Francis Bay Yamaha</SectionLabel>
          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-12">
            <h2 data-reveal="lines" className={`${H2} text-brand`}>
              <Lines lines={["Life is better", "on the water."]} />
            </h2>
            <div className="lg:pt-2">
              <p data-reveal className="text-xl font-medium leading-snug text-ink sm:text-[22px]">
                And every great day out starts with the right people behind you.
              </p>
              <p data-reveal style={delay(120)} className="mt-5 leading-relaxed text-muted">
                Since opening in December 2019, {CONTACTS.sales.name} and his team have grown St Francis Yamaha into
                one of the top Yamaha dealerships in South Africa. From your first boat to your next offshore
                adventure, we bring together premium equipment, Yamaha expertise and a genuine love for the ocean, all
                under one roof in an 800&nbsp;m² showroom in Sea Vista.
              </p>
              <TextLink data-reveal style={delay(220)} href="#contact" className="mt-8">
                Meet the team
              </TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* 02 RANGE */}
      <section id="range" className="gutter scroll-mt-20 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionLabel n="02">Find your next adventure</SectionLabel>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <h2 data-reveal="lines" className={`${H2} text-brand`}>
              <Lines lines={["Built for your", "kind of blue."]} />
            </h2>
            <TextLink data-reveal href="/boat-sales" className="md:pb-3">
              See current stock
            </TextLink>
          </div>

          {/* Swipeable on phones, three-up grid from tablet */}
          <div className="no-scrollbar bleed mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:mx-0 md:mt-14 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
            {RANGE.map((r, i) => (
              <Link key={r.n} href={r.href} className="group block w-[82%] shrink-0 snap-start sm:w-[58%] md:w-auto">
                <div data-reveal="clip" style={delay(i * 140)} className="relative aspect-[4/4.2]">
                  <div className="reveal-clip absolute inset-0 overflow-hidden bg-navy">
                    <div className="reveal-zoom absolute inset-0">
                      <Image
                        src={r.img}
                        alt={r.alt}
                        fill
                        sizes="(min-width: 768px) 33vw, 82vw"
                        className={`object-cover ${r.pos} transition-[scale] duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]`}
                      />
                    </div>
                    <div className="absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/15" />
                  </div>
                </div>
                <div data-reveal style={delay(150 + i * 140)} className="mt-6 grid grid-cols-[32px_1fr] md:grid-cols-[36px_1fr]">
                  <span className="pt-2 text-xs text-muted">{r.n}</span>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.01em] text-ink md:text-[26px]">{r.title}</h3>
                    <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">{r.copy}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                      <span className="link-line">{r.cta}</span> <ArrowUpRight />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 03 SERVICES */}
      <section id="services" className="grid scroll-mt-16 bg-navy text-white lg:grid-cols-[1fr_1.1fr]">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-auto lg:min-h-full">
          <div className="parallax absolute inset-0">
            <Image
              src="/images/rev.jpg"
              alt="The St Francis Yamaha dealership in Sea Vista with a Yamaha outboard in the foreground"
              fill
              sizes="(min-width: 1024px) 75vw, 100vw"
              className="object-cover object-[70%_50%] lg:object-[38%_50%]"
            />
          </div>
          <div
            data-reveal
            className="absolute bottom-4 left-4 bg-navy/90 px-5 py-4 backdrop-blur sm:bottom-6 sm:left-6 sm:w-80 sm:px-6 sm:py-5"
          >
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              <CountUp to={850} /> m²
            </p>
            <p className="eyebrow mt-2 text-white/70">Purpose-equipped workshop</p>
          </div>
        </div>

        <div className="px-5 py-20 sm:px-6 lg:px-16 lg:py-24 xl:pl-20 xl:pr-24">
          <SectionLabel n="03" light>
            Expertise you can trust
          </SectionLabel>
          <h2 data-reveal="lines" className={`${H2} mt-6`}>
            <Lines lines={["Confidence.", "Built in."]} />
          </h2>
          <p data-reveal style={delay(150)} className="mt-8 max-w-lg leading-relaxed text-white/75">
            More than a dealership. Your specialist marine partner, from precision servicing to a completely custom rig,
            with modern machinery, special tools and fully pneumatic equipment.
          </p>

          <ul className="mt-12 max-w-xl border-t border-white/15">
            {SERVICES.map((s, i) => (
              <li key={s.title} data-reveal style={delay(i * 90)} className="border-b border-white/15">
                <a
                  href="#contact"
                  className="group relative grid grid-cols-[32px_1fr_auto] items-start gap-2 py-5 sm:grid-cols-[40px_1fr_auto]"
                >
                  <span className="absolute inset-y-0 -left-3 right-0 origin-left scale-x-0 bg-white/[0.04] transition-transform duration-500 ease-[cubic-bezier(.77,0,.18,1)] group-hover:scale-x-100" />
                  <span className="relative pt-1 text-xs text-white/50 transition-colors group-hover:text-brand-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative transition-transform duration-500 group-hover:translate-x-1.5">
                    <span className="block text-[17px] font-medium sm:text-lg">{s.title}</span>
                    <span className="mt-1 block text-[13px] text-white/60">{s.copy}</span>
                  </span>
                  <ArrowUpRight className="relative mt-2 text-white/70 group-hover:text-brand-soft" />
                </a>
              </li>
            ))}
          </ul>

          <div data-reveal className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <ButtonLink href="#contact">Book a service</ButtonLink>
            <span className="text-center text-sm text-white/60 sm:text-left">Care that goes further.</span>
          </div>
        </div>
      </section>

      {/* 04 BACKYARD */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="parallax absolute inset-0">
          <Image
            src="/images/outboard.webp"
            alt="Friends on a boat powered by a Yamaha 150hp outboard cutting through open water"
            fill
            sizes="(min-width: 1024px) 100vw, 1200px"
            className="object-cover object-[70%_50%]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/60 to-navy/40 md:bg-gradient-to-r md:from-navy/90 md:via-navy/55 md:to-transparent" />
        <div className="gutter relative mx-auto flex min-h-[600px] max-w-7xl flex-col justify-between py-20 lg:min-h-[680px]">
          <div>
            <SectionLabel n="04" light>
              This is our backyard
            </SectionLabel>
            <h2 data-reveal="lines" className={`${H2} mt-8 leading-[1.05]`}>
              <Lines lines={["A place like no other.", "A life on the water."]} />
            </h2>
            <p data-reveal style={delay(200)} className="mt-8 max-w-md leading-relaxed text-white/90">
              Quiet canals. Early launches. Endless horizons. We&apos;re not just based in St Francis Bay. We live it.
              Let our local knowledge take you further.
            </p>
          </div>
          <div data-reveal className="mt-16 flex flex-wrap items-end justify-between gap-6">
            <TextLink href="#contact" tone="inherit">
              Visit the showroom
            </TextLink>
            <span className="text-xs tabular-nums text-white/75">{ADDRESS.coordinates}</span>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* 05 CONTACT */}
      <section id="contact" className="gutter scroll-mt-16 bg-brand py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
          <div>
            <SectionLabel n="05" light>
              Let&apos;s get you on the water
            </SectionLabel>
            <h2 data-reveal="lines" className={`${H2} mt-6 lg:text-[60px]`}>
              <Lines lines={["Your next adventure", "starts with hello."]} />
            </h2>
            <p data-reveal style={delay(150)} className="mt-8 max-w-md leading-relaxed text-white/90">
              Visit our showroom, talk boats, or tell us what you&apos;re dreaming of. We&apos;ll take it from there.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {TEAM.map((t, i) => (
                <div key={t.name} data-reveal style={delay(200 + i * 100)}>
                  <p className="font-semibold">{t.name}</p>
                  <p className="eyebrow mt-1 text-white/70">{t.role}</p>
                  <a href={telHref(t.phone)} className="link-line mt-3 inline-block py-1 text-sm">
                    {t.phone}
                  </a>
                  <br />
                  <a href={mailtoHref(t.email)} className="link-line inline-block break-all py-1 text-sm">
                    {t.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
