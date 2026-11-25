"use client";

import { useState, useTransition } from "react";
import { deleteListing } from "./actions";

/** Two-step delete (click, then confirm) instead of a browser confirm() dialog. */
export default function DeleteButton({ slug, title }: { slug: string; title: string }) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className="min-h-11 px-3 text-sm text-muted hover:text-brand">
        Delete
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      {error && <span className="text-xs text-brand">{error}</span>}
      <button
        type="button"
        disabled={pending}
        aria-label={`Confirm deleting ${title}`}
        onClick={() =>
          start(async () => {
            const res = await deleteListing(slug);
            if (res?.error) setError(res.error);
          })
        }
        className="min-h-11 bg-brand px-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete for good"}
      </button>
      {!pending && (
        <button type="button" onClick={() => setArmed(false)} className="min-h-11 px-2 text-sm text-muted hover:text-ink">
          Cancel
        </button>
      )}
    </div>
  );
}
