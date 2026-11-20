import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CameraIcon } from "../components/icons";
import { categoryLabel, formatPrice, type Listing } from "../lib/listings";
import { stagger } from "../lib/motion";

export default function ListingCard({
  listing: l,
  index = 0,
  sizes = "(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw",
}: {
  listing: Listing;
  /** Position in the grid: staggers the entrance and loads the first row eagerly. */
  index?: number;
  sizes?: string;
}) {
  return (
    <Link href={`/boat-sales/${l.slug}`} className="card-in group flex flex-col" style={stagger(Math.min(index, 8))}>
      <div className="relative aspect-[4/3] overflow-hidden bg-navy">
        <Image
          src={l.images[0]}
          alt={l.title}
          fill
          sizes={sizes}
          loading={index < 3 ? "eager" : "lazy"}
          className="object-cover transition-[scale] duration-[1.1s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="eyebrow bg-white/95 px-2.5 py-1.5 text-[10px] text-ink">{categoryLabel(l.category)}</span>
          {l.wasPrice && <span className="eyebrow bg-brand px-2.5 py-1.5 text-[10px] text-white">Reduced</span>}
        </div>
        {l.images.length > 1 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-white">
            <CameraIcon className="h-4 w-4" />
            <span className="sr-only">Photos:</span>
            {l.images.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink transition-colors group-hover:text-brand sm:text-xl">
          {l.title}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <p className="flex flex-wrap items-baseline gap-x-2.5">
            <span className={`font-semibold tabular-nums ${l.price ? "text-lg text-ink" : "text-sm text-muted"}`}>
              {formatPrice(l.price)}
            </span>
            {l.wasPrice && <s className="text-sm tabular-nums text-muted">{formatPrice(l.wasPrice)}</s>}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand">
            <span className="link-line">View</span> <ArrowUpRight />
          </span>
        </div>
      </div>
    </Link>
  );
}
