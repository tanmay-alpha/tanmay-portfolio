import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { KonamiPanel } from "@/components/ui/konami-panel";
import { DockNav } from "@/components/ui/dock-nav";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = "https://tanmay-portfolio-coral.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tanmay Mangal — AI/ML Engineer & Full-Stack Developer",
    template: "%s — Tanmay Mangal",
  },
  description:
    "AI/ML engineer building MAET (real-time NSE trading terminal), Lumint (AI fraud platform), and FinCalc India. VIT Bhopal '28. Open to AI/ML and full-stack roles.",
  keywords: [
    "Tanmay Mangal",
    "AI/ML Engineer",
    "Full-Stack Developer",
    "Quant",
    "NSE",
    "VIT Bhopal",
    "Portfolio",
  ],
  authors: [{ name: "Tanmay Mangal", url: siteUrl }],
  creator: "Tanmay Mangal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Tanmay Mangal",
    title: "Tanmay Mangal — AI/ML Engineer & Full-Stack Developer",
    description:
      "AI/ML engineer building MAET (real-time NSE trading terminal), Lumint (AI fraud platform), and FinCalc India. VIT Bhopal '28. Open to AI/ML and full-stack roles.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tanmay Mangal — AI/ML Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanmay Mangal — AI/ML Engineer & Full-Stack Developer",
    description:
      "AI/ML engineer building MAET (real-time NSE trading terminal), Lumint (AI fraud platform), and FinCalc India. VIT Bhopal '28. Open to AI/ML and full-stack roles.",
    images: ["/opengraph-image"],
    creator: "@tanmay_alpha",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Plausible loads only if NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
  // It runs with strategy="afterInteractive" so it never blocks render.
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-zinc-100 antialiased overflow-x-hidden">
        <a href="#top" className="skip-link">Skip to content</a>
        {children}
        <KonamiPanel />
        <DockNav />
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
