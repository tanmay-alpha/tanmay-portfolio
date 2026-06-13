import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif, Noto_Serif_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Cursor } from "@/components/ui/cursor";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { Preloader } from "@/components/ui/preloader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const notoJp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["200", "400"],
  variable: "--font-noto-jp",
  display: "swap",
});

const siteUrl = "https://tanmay-portfolio-coral.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tanmay Mangal — AI/ML Engineer",
    template: "%s — Tanmay Mangal",
  },
  description:
    "AI/ML engineer and full-stack builder. B.Tech CSE at VIT Bhopal. Build to understand. Trade to learn. Ship to compound.",
  keywords: [
    "Tanmay Mangal",
    "AI/ML Engineer",
    "Full-Stack Developer",
    "Portfolio",
    "VIT Bhopal",
  ],
  authors: [{ name: "Tanmay Mangal", url: siteUrl }],
  creator: "Tanmay Mangal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Tanmay Mangal",
    title: "Tanmay Mangal — AI/ML Engineer",
    description:
      "AI/ML engineer and full-stack builder. Build to understand. Trade to learn. Ship to compound.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Tanmay Mangal — AI/ML Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanmay Mangal — AI/ML Engineer",
    description:
      "AI/ML engineer and full-stack builder. Build to understand. Trade to learn. Ship to compound.",
    images: ["/og.png"],
    creator: "@tanmay_alpha",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
};

// Block any flash of incorrect cursor class. Lenis / preloader handle the rest.
const cursorInitScript = `
(function() {
  try {
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!coarse && !reduced) {
      document.documentElement.classList.add('has-custom-cursor');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${instrument.variable} ${notoJp.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <Script id="cursor-init" strategy="beforeInteractive">
          {cursorInitScript}
        </Script>
      </head>
      <body className="min-h-screen bg-bg text-text-primary antialiased overflow-x-hidden">
        <SmoothScroll />
        <Preloader />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
