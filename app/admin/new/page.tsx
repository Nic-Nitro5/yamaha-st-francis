import { Suspense } from "react";
import { requireAdmin } from "../_lib/auth";
import ListingForm from "../ListingForm";
import { FormShell } from "../FormShell";

export default function NewListingPage() {
  return (
    <FormShell title="Add listing">
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <Gate />
      </Suspense>
    </FormShell>
  );
}

async function Gate() {
  await requireAdmin();
  return <ListingForm />;
}
