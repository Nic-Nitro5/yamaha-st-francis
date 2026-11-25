import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main id="top" className="min-h-[70vh]">
      {/* Navy band sits under the fixed site header, as on the listing pages. */}
      <div className="bg-navy pt-24 lg:pt-28" />
      {children}
    </main>
  );
}
