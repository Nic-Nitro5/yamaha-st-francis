"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, categoryLabel, formatPrice, type Category, type Listing } from "../lib/listings";
import DeleteButton from "./DeleteButton";
import Thumb from "./Thumb";

export type Row = Pick<Listing, "slug" | "title" | "category" | "status" | "year" | "price"> & {
  cover?: string;
  photos: number;
};

type Status = "all" | Listing["status"];

/** Lower-case text a row can be found by: title, type, year and price (with and without spaces). */
const haystack = (r: Row) =>
  [r.title, categoryLabel(r.category), r.year ?? "", r.price ?? "", formatPrice(r.price).replace(/\s/g, "")]
    .join(" ")
    .toLowerCase();

export default function ListingTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [category, setCategory] = useState<Category | "all">("all");

  const indexed = useMemo(() => rows.map((r) => ({ row: r, text: haystack(r) })), [rows]);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = indexed
    .filter(
      ({ row, text }) =>
        (status === "all" || row.status === status) &&
        (category === "all" || row.category === category) &&
        words.every((w) => text.includes(w.replace(/\s/g, ""))),
    )
    .map((x) => x.row);

  const filtered = Boolean(words.length) || status !== "all" || category !== "all";
  const chip = (active: boolean) =>
    `min-h-11 border px-3 text-sm transition-colors ${active ? "border-navy bg-navy text-white" : "border-ink/15 text-ink hover:border-ink/40"}`;

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, type, year or price…"
          aria-label="Search listings"
          className="min-h-11 w-full border border-ink/20 bg-white px-3 text-base text-ink outline-none focus:border-navy lg:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "available", "sold"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)} className={chip(status === s)}>
              {s === "all" ? "All" : s === "available" ? "Available" : "Sold"}
            </button>
          ))}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "all")}
            aria-label="Filter by type"
            className="min-h-11 border border-ink/15 bg-transparent px-3 text-base text-ink sm:text-sm"
          >
            <option value="all">All types</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted" aria-live="polite">
        {filtered ? `${shown.length} of ${rows.length} listings` : `${rows.length} listings`}
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setCategory("all");
            }}
            className="ml-3 underline hover:text-ink"
          >
            Clear
          </button>
        )}
      </p>

      {shown.length === 0 ? (
        <p className="mt-3 border-y border-ink/10 py-10 text-center text-sm text-muted">No listings match.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
          {shown.map((l) => {
            const href = `/admin/edit?slug=${encodeURIComponent(l.slug)}`;
            return (
              <li key={l.slug} className="flex items-center gap-4 py-3">
                <Thumb src={l.cover} className={`h-16 w-20 shrink-0 ${l.status === "sold" ? "grayscale" : ""}`} />
                <div className="min-w-0 flex-1">
                  <Link href={href} className="line-clamp-2 font-medium leading-snug text-ink hover:text-brand">
                    {l.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {l.status === "sold" && <span className="eyebrow mr-2 bg-navy px-1.5 py-0.5 text-[10px] text-white">Sold</span>}
                    {categoryLabel(l.category)}
                    {l.year ? ` · ${l.year}` : ""} · {formatPrice(l.price)} · {l.photos} photo{l.photos === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link href={href} className="flex min-h-11 items-center px-3 text-sm text-ink hover:text-brand">
                    Edit
                  </Link>
                  <DeleteButton slug={l.slug} title={l.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
