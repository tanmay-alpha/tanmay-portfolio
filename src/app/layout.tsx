import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { THEME_INIT_SCRIPT } from "./theme-initializer";
import "./globals.css";
import { TopNav } from "@/components/ui/top-nav";

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
    default: "Tanmay Mangal",
    template: "%s — Tanmay Mangal",
  },
  description:
    "Tanmay Mangal — B.Tech CSE at VIT Bhopal. Building at the intersection of ML, financial systems, and full-stack engineering.",
  keywords: [
    "Tanmay Mangal",
    "VIT Bhopal",
    "Quant ML",
    "Full-Stack",
    "MAET",
    "Lumint",
    "FinCalc India",
    "Portfolio",
  ],
  authors: [{ name: "Tanmay Mangal", url: siteUrl }],
  creator: "Tanmay Mangal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Tanmay Mangal",
    title: "Tanmay Mangal",
    description:
      "Tanmay Mangal — B.Tech CSE at VIT Bhopal. Building at the intersection of ML, financial systems, and full-stack engineering.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tanmay Mangal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanmay Mangal",
    description:
      "Tanmay Mangal — B.Tech CSE at VIT Bhopal. Building at the intersection of ML, financial systems, and full-stack engineering.",
    images: ["/opengraph-image"],
    creator: "@tanmay_alpha",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#07080E",
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
      className={`${interTight.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-text-1 antialiased overflow-x-hidden">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <a href="#top" className="skip-link">Skip to content</a>
        <TopNav />
        {children}
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
