import Link from "next/link";
import type { ReactNode } from "react";

export function FormShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="gutter py-10 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-muted hover:text-ink">
          ← All listings
        </Link>
        <h1 className="mb-8 mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {children}
      </div>
    </section>
  );
}
