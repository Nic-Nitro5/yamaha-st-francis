import Link from "next/link";
import { Suspense } from "react";
import { categoryLabel, formatPrice } from "../lib/listings";
import { buttonClass } from "../components/ui";
import { logout } from "./actions";
import { requireAdmin } from "./_lib/auth";
import { isDeploying, readListings, storeMode } from "./_lib/store";
import DeleteButton from "./DeleteButton";
import Thumb from "./Thumb";

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <section className="gutter py-10 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={<p className="text-sm text-muted">Loading listings…</p>}>
          <Dashboard searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await requireAdmin();
  const params = await searchParams;
  const mode = storeMode();
  if (mode === "unconfigured") {
    return <Notice tone="error">GITHUB_TOKEN isn&apos;t set on this deployment, so listings can&apos;t be loaded or saved.</Notice>;
  }

  const { listings, head } = await readListings();
  const sorted = [...listings].sort(
    (a, b) => Number(a.status === "sold") - Number(b.status === "sold") || a.order - b.order,
  );
  const available = listings.filter((l) => l.status === "available").length;
  const saved = typeof params.saved === "string" ? listings.find((l) => l.slug === params.saved) : undefined;
  const deleted = typeof params.deleted === "string" ? params.deleted : undefined;
  const live = mode === "github" ? "It will be live on the site in 1–2 minutes." : "Saved to your local files.";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brand">Stock dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink">Listings</h1>
          <p className="mt-2 text-sm text-muted">
            {available} available · {listings.length - available} sold
            {mode === "local" && " · local mode (changes write to this computer, not GitHub)"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={logout}>
            <button type="submit" className="min-h-11 px-3 text-sm text-muted hover:text-ink">
              Sign out
            </button>
          </form>
          <Link href="/admin/new" className={buttonClass("navyToBrand", "sm")}>
            Add listing
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {saved && <Notice>Saved &ldquo;{saved.title}&rdquo;. {live}</Notice>}
        {deleted && <Notice>Removed &ldquo;{deleted}&rdquo; and its photos. {live}</Notice>}
        {isDeploying(head) && !saved && !deleted && (
          <Notice tone="info">Recent changes are still deploying. New photos may not show here until that finishes.</Notice>
        )}
      </div>

      <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {sorted.map((l) => (
          <li key={l.slug} className="flex items-center gap-4 py-3">
            <Thumb src={l.images[0]} className={`h-16 w-20 shrink-0 ${l.status === "sold" ? "grayscale" : ""}`} />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/edit?slug=${encodeURIComponent(l.slug)}`} className="line-clamp-2 font-medium leading-snug text-ink hover:text-brand">
                {l.title}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {l.status === "sold" && <span className="eyebrow mr-2 bg-navy px-1.5 py-0.5 text-[10px] text-white">Sold</span>}
                {categoryLabel(l.category)} · {formatPrice(l.price)} · {l.images.length} photo{l.images.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link href={`/admin/edit?slug=${encodeURIComponent(l.slug)}`} className="flex min-h-11 items-center px-3 text-sm text-ink hover:text-brand">
                Edit
              </Link>
              <DeleteButton slug={l.slug} title={l.title} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Notice({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "info" | "error" }) {
  const styles = {
    ok: "border-whatsapp/40 bg-whatsapp/10",
    info: "border-navy/20 bg-navy/5",
    error: "border-brand/40 bg-brand/10",
  }[tone];
  return <p className={`border px-4 py-3 text-sm text-ink ${styles}`}>{children}</p>;
}
