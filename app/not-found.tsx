import type { Metadata } from "next";
import { ButtonLink } from "./components/ui";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main id="top" className="bg-navy text-white">
      <div className="gutter mx-auto flex min-h-[80svh] max-w-7xl flex-col justify-center pb-20 pt-32">
        <p className="intro eyebrow text-brand-soft">404</p>
        <h1 className="intro mt-5 max-w-2xl text-5xl font-bold leading-[1] tracking-[-0.035em] sm:text-7xl">
          Lost at sea.
        </h1>
        <p className="intro mt-6 max-w-md leading-relaxed text-white/80">
          We couldn&apos;t find that page. The boat you were looking for may have been sold, or the link may be out of
          date.
        </p>
        <div className="intro mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <ButtonLink href="/boat-sales">Browse current stock</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
