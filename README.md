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
  admin/                  Stock dashboard at /admin (see "Stock dashboard" below)
data/listings.json        Boat-sales stock, edited through the dashboard
assets/logo-source.webp   Original dealership logo (input for the brand script)
public/images/            Site photography, header logo, stock photos
scripts/                  One-off data and asset scripts
```

## Common changes

- **Phone numbers, emails, address, trading hours:** edit `app/lib/site.ts`. Every page reads from it.
- **Colours:** edit the `@theme static` block at the top of `app/globals.css`.

## Stock dashboard

`/admin` lets staff add, edit, mark as sold and delete listings, including their photos. It's
signed in with one shared password.

Every save is a single commit to this repo: `data/listings.json` plus any photos added or removed
under `public/images/stock/<slug>/`. Deleting a listing also deletes its photo folder. Vercel
redeploys on the push, so changes go live in 1–2 minutes. History and undo come from git (revert the
`content: ...` commit). Photos are resized to at most 2000px and converted to WebP in the browser
before upload, which keeps each request under Vercel's 4.5MB limit.

For step-by-step Vercel setup (token, environment variables, checks), see [DEPLOY.md](DEPLOY.md).

Environment variables (set them in Vercel → Project → Settings → Environment Variables):

| Variable         | Value                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | Dashboard password. Changing it signs everyone out.                                |
| `GITHUB_TOKEN`   | Fine-grained token with **Contents: read and write** on this repo only.            |
| `GITHUB_REPO`    | Optional, `owner/name`. Defaults to the repo Vercel deploys from.                  |
| `GITHUB_BRANCH`  | Optional. Defaults to `main`.                                                      |

Locally, without `GITHUB_TOKEN`, the dashboard writes straight to your working copy instead, so you
can try it with `ADMIN_PASSWORD=... npm run dev` and review the changes with `git diff`.

## Scripts

### Import stock from the old site

```bash
node scripts/import-listings.mjs
```

Pulls every product from the current Squarespace site, cleans titles, prices and descriptions, keeps
available listings plus the 12 most recent sold ones, downloads their photos to
`public/images/stock/<slug>/` and writes `data/listings.json`. **This overwrites
`data/listings.json`, including anything edited in the dashboard,** so only re-run it before the
dashboard is in use. Fixes for bad source data go in the `OVERRIDES` list at the top of the script so
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
