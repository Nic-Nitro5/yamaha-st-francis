# St Francis Bay Yamaha

Website for St Francis Bay Yamaha, a Yamaha marine dealership in St Francis Bay, South Africa.
Built with Next.js 16 (App Router, Cache Components) and Tailwind CSS 4.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Project structure

```
app/
  layout.tsx              Root layout: header, footer, scroll-reveal observer, metadata defaults
  page.tsx                Home page
  not-found.tsx           404 page
  boat-sales/
    page.tsx              Stock list with filters (?type=boats|waverunners|jetboats|outboards|golf-carts)
    StockBrowser.tsx      Filter chips + sort (client)
    ListingCard.tsx       Card used in the stock grid and "You might also like"
    [slug]/page.tsx       Listing detail, one static page per available listing
    [slug]/Gallery.tsx    Photo gallery with full-screen viewer (client)
  components/
    Header.tsx, Footer.tsx
    ui.tsx                SmartLink, ButtonLink, TextLink, SectionLabel
    icons.tsx             All SVG icons
    Motion.tsx            RevealObserver (scroll reveals) and CountUp
    Lines.tsx             Masked line-by-line heading animation
    ContactForm.tsx, Testimonials.tsx, CopyrightYear.tsx
  lib/
    site.ts               Business details: contacts, address, hours, link helpers
    listings.ts           Listing types, queries and price formatting
    motion.ts             delay() / stagger() animation style helpers
  globals.css             Theme colours, layout utilities (gutter, bleed) and all animations
data/listings.json        Boat-sales stock (generated, see below)
assets/logo-source.webp   Original dealership logo (input for the brand script)
public/images/            Site photography, header logo, stock photos
scripts/                  One-off data and asset scripts
```

## Common changes

- **Phone numbers, emails, address, trading hours:** edit `app/lib/site.ts`. Every page reads from it.
- **Colours:** edit the `@theme static` block at the top of `app/globals.css`.

## Scripts

### Import stock from the old site

```bash
node scripts/import-listings.mjs
```

Pulls every product from the current Squarespace site, cleans titles, prices and descriptions, keeps
available listings plus the 12 most recent sold ones, downloads their photos to
`public/images/stock/<slug>/` and writes `data/listings.json`. Re-run whenever stock changes until the
old site is retired. Fixes for bad source data go in the `OVERRIDES` list at the top of the script so
they survive a re-import.

### Rebuild logo and favicons

```bash
node scripts/build-brand-assets.mjs
```

Builds `public/images/logo-on-dark.png` (logo with white text for the navy header) and the favicons
(`app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`) from `assets/logo-source.webp`.

## Notes

- The contact form has no backend yet: it opens the visitor's email app with the enquiry prefilled.
- Scroll animations respect `prefers-reduced-motion`, and all content stays visible without JavaScript.
