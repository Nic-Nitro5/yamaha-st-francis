"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ListingCard from "./ListingCard";
import { CATEGORIES, type Category, type Listing } from "../lib/listings";

type Filter = Category | "all";
type Sort = "featured" | "price-asc" | "price-desc" | "year";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "year", label: "Newest model year" },
];

const isCategory = (v: string | null): v is Category => CATEGORIES.some((c) => c.id === v);

// Listings without a price always go last when sorting by price.
const byPrice = (dir: 1 | -1) => (a: Listing, b: Listing) =>
  a.price && b.price ? (a.price - b.price) * dir : a.price ? -1 : b.price ? 1 : 0;

const SORTERS: Record<Sort, (a: Listing, b: Listing) => number> = {
  featured: (a, b) => a.order - b.order,
  "price-asc": byPrice(1),
  "price-desc": byPrice(-1),
  year: (a, b) => (b.year ?? 0) - (a.year ?? 0) || a.order - b.order,
};

const countLabel = (n: number) => `${n} ${n === 1 ? "listing" : "listings"}`;

/** Static grid, also used as the Suspense fallback before the URL filter is known. */
export function StockGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l, i) => (
        <ListingCard key={l.slug} listing={l} index={i} />
      ))}
    </div>
  );
}

/**
 * Filter chips + sort over the stock list. The category lives in the URL
 * (/boat-sales?type=waverunners) so it can be linked to and survives back/forward.
 */
export default function StockBrowser({ listings }: { listings: Listing[] }) {
  const type = useSearchParams().get("type");
  const filter: Filter = isCategory(type) ? type : "all";
  const [sort, setSort] = useState<Sort>("featured");

  function choose(f: Filter) {
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("type");
    else url.searchParams.set("type", f);
    // Next.js keeps useSearchParams in sync with history.replaceState.
    window.history.replaceState(null, "", url);
  }

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const l of listings) c[l.category] = (c[l.category] ?? 0) + 1;
    return c;
  }, [listings]);

  const shown = useMemo(
    () => listings.filter((l) => filter === "all" || l.category === filter).sort(SORTERS[sort]),
    [listings, filter, sort],
  );

  const chips = [
    { id: "all" as Filter, label: "All stock", n: listings.length },
    ...CATEGORIES.filter((c) => counts[c.id]).map((c) => ({ id: c.id as Filter, label: c.label, n: counts[c.id] ?? 0 })),
  ];

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-ink/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Category chips scroll sideways on small screens */}
        <div role="group" aria-label="Filter by type" className="no-scrollbar bleed flex gap-2 overflow-x-auto lg:mx-0 lg:flex-wrap lg:px-0">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter === c.id}
              onClick={() => choose(c.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 border px-4 text-sm transition-all duration-300 active:scale-95 ${
                filter === c.id
                  ? "border-navy bg-navy text-white"
                  : "border-ink/15 text-ink hover:-translate-y-0.5 hover:border-ink/40"
              }`}
            >
              {c.label}
              <span className={`text-xs tabular-nums ${filter === c.id ? "text-white/60" : "text-muted"}`}>{c.n}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <p className="text-sm text-muted lg:hidden" aria-live="polite">
            {countLabel(shown.length)}
          </p>
          <label className="flex items-center gap-3 text-sm">
            <span className="eyebrow hidden text-muted sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="min-h-11 cursor-pointer border border-ink/15 bg-transparent py-2 pl-3 pr-9 text-base text-ink sm:text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mb-6 mt-6 hidden text-sm text-muted lg:block" aria-live="polite">
        Showing {countLabel(shown.length)}
      </p>

      {/* Remount the grid on every change so the cards replay their entrance */}
      <div key={`${filter}-${sort}`} className="mt-8 lg:mt-0">
        <StockGrid listings={shown} />
      </div>
    </div>
  );
}
