import Link from "next/link";
import { Suspense } from "react";
import { buttonClass } from "../components/ui";
import { logout } from "./actions";
import { requireAdmin } from "./_lib/auth";
import { isDeploying, readListings, storeMode } from "./_lib/store";
import ListingTable from "./ListingTable";

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

      <ListingTable
        rows={sorted.map((l) => ({
          slug: l.slug,
          title: l.title,
          category: l.category,
          status: l.status,
          year: l.year,
          price: l.price,
          cover: l.images[0],
          photos: l.images.length,
        }))}
      />
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
