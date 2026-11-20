import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.stfrancisbayyamaha.com"),
  title: "St Francis Bay Yamaha | Boats, Outboards & WaveRunners",
  description:
    "Yamaha marine specialists in St Francis Bay, South Africa. Boat sales, Yamaha outboards, WaveRunners, certified servicing, custom rigging and storage.",
};

export const viewport: Viewport = {
  themeColor: "#0b1a2c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-full">
        {/* Without JS, show everything that would otherwise reveal on scroll. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}[data-reveal] .line>span,.reveal-zoom{transform:none!important}.reveal-clip{clip-path:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
