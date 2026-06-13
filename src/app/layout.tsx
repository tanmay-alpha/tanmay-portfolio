import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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

const siteUrl = "https://tanmay-portfolio.vercel.app";

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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
};

// Inline, blocking: resolves the user's preferred theme BEFORE React
// hydrates so the page never flashes the wrong palette. Reads
// localStorage("theme") if set, else falls back to OS preference.
// Default is dark when no signal is available.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored ? stored : (prefersDark ? 'dark' : 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
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
      className={`${inter.variable} ${jetbrains.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-screen bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
