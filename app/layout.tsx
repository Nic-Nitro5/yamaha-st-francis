import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { RevealObserver } from "./components/Motion";
import { SITE } from "./lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Boats, Outboards & WaveRunners`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: "#0b1a2c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-full">
        {/* Without JS, show everything that would otherwise reveal on scroll. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-reveal] .line>span,.reveal-zoom{transform:none!important}.reveal-clip{clip-path:none!important}`}</style>
        </noscript>
        <RevealObserver />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
