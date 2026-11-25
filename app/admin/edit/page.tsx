import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "../_lib/auth";
import { readListings } from "../_lib/store";
import ListingForm from "../ListingForm";
import { FormShell } from "../FormShell";

/**
 * /admin/edit?slug=... A query param rather than a [slug] segment: the site header reads the
 * pathname, which a dynamic segment with no static params can't provide at build time.
 */
export default function EditListingPage({ searchParams }: PageProps<"/admin/edit">) {
  return (
    <FormShell title="Edit listing">
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <Editor searchParams={searchParams} />
      </Suspense>
    </FormShell>
  );
}

async function Editor({ searchParams }: Pick<PageProps<"/admin/edit">, "searchParams">) {
  await requireAdmin();
  const { slug } = await searchParams;
  const { listings } = await readListings();
  const listing = listings.find((l) => l.slug === slug);
  if (!listing) notFound();
  return (
    <>
      {listing.status === "available" && (
        <a href={`/boat-sales/${listing.slug}`} target="_blank" className="-mt-4 mb-6 inline-block text-sm text-muted underline hover:text-ink">
          View on site
        </a>
      )}
      <ListingForm listing={listing} />
    </>
  );
}
