import data from "@/data/listings.json";

export type Category = "boats" | "waverunners" | "jetboats" | "outboards" | "golf-carts";

export type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };

export type Listing = {
  slug: string;
  title: string;
  category: Category;
  status: "available" | "sold";
  year: number | null;
  price: number | null;
  wasPrice: number | null;
  order: number;
  sourceUrl: string;
  description: Block[];
  images: string[];
};

export const CATEGORIES: { id: Category; label: string; singular: string }[] = [
  { id: "boats", label: "Boats", singular: "Boat" },
  { id: "waverunners", label: "WaveRunners & PWC", singular: "WaveRunner" },
  { id: "jetboats", label: "Jetboats", singular: "Jetboat" },
  { id: "outboards", label: "Outboards", singular: "Outboard" },
  { id: "golf-carts", label: "Golf carts", singular: "Golf cart" },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)?.singular ?? c;

const listings = data as Listing[];

export const availableListings = () => listings.filter((l) => l.status === "available");
export const soldListings = () => listings.filter((l) => l.status === "sold");
export const getListing = (slug: string) => availableListings().find((l) => l.slug === slug);

export function relatedListings(l: Listing, n = 3) {
  const others = availableListings().filter((x) => x.slug !== l.slug);
  const same = others.filter((x) => x.category === l.category);
  return [...same, ...others.filter((x) => x.category !== l.category)].slice(0, n);
}

/** South African formatting: R1 895 000. Listings without a price are "Price on request". */
export function formatPrice(n: number | null) {
  if (!n) return "Price on request";
  const NBSP = String.fromCharCode(160); // non-breaking space keeps "R1 895 000" from wrapping mid-number
  return "R" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}
