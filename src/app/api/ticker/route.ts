import { NextResponse } from "next/server";

/**
 * NSE ticker feed. Fetches ~10 NSE symbols from Yahoo Finance and caches
 * the result for 15s (per spec). On ANY error — network, timeout, parse
 * failure, non-200 — we return 200 with a realistic-looking fallback
 * payload so the client can always render the tape.
 *
 * Shape returned:
 *   { fallback: boolean, fetchedAt: string, symbols: TickerSymbol[] }
 */

export const revalidate = 15;
export const runtime = "nodejs";

type TickerSymbol = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
};

// Realistic-looking fallback numbers (close enough to the 2026 NSE regime
// that the tape looks plausible; they're not live data).
const FALLBACK_SYMBOLS: TickerSymbol[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 1298.4, change: 12.6, changePercent: 0.98, currency: "INR" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 4082.15, change: -18.4, changePercent: -0.45, currency: "INR" },
  { symbol: "INFY", name: "Infosys", price: 1874.5, change: 6.2, changePercent: 0.33, currency: "INR" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1621.8, change: -4.1, changePercent: -0.25, currency: "INR" },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1244.2, change: 9.8, changePercent: 0.79, currency: "INR" },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 738.6, change: -3.4, changePercent: -0.46, currency: "INR" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 1562.3, change: 21.2, changePercent: 1.38, currency: "INR" },
  { symbol: "WIPRO", name: "Wipro", price: 542.7, change: 1.8, changePercent: 0.33, currency: "INR" },
  { symbol: "SBIN", name: "State Bank of India", price: 821.4, change: 4.6, changePercent: 0.56, currency: "INR" },
  { symbol: "NIFTYBEES", name: "Nippon India ETF Nifty 50 BeES", price: 248.92, change: 0.42, changePercent: 0.17, currency: "INR" },
];

const YAHOO_SYMBOLS = [
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "TATAMOTORS.NS",
  "BHARTIARTL.NS",
  "WIPRO.NS",
  "SBIN.NS",
  "NIFTYBEES.NS",
];

const YAHOO_URL = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${YAHOO_SYMBOLS.join(",")}`;

type YahooQuote = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
};

type YahooResponse = {
  quoteResponse?: {
    result?: YahooQuote[];
    error?: unknown;
  };
};

async function fetchFromYahoo(): Promise<TickerSymbol[] | null> {
  // 5s timeout via AbortController
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(YAHOO_URL, {
      headers: {
        // Yahoo's quote endpoint is sensitive to UA. Send a realistic one.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: controller.signal,
      // next: { revalidate: 15 } is set on the route, but pass cache hint too.
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as YahooResponse;
    const results = data?.quoteResponse?.result;
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const mapped = results
      .map((q): TickerSymbol | null => {
        const price = q.regularMarketPrice;
        const change = q.regularMarketChange;
        const changePct = q.regularMarketChangePercent;
        if (typeof price !== "number" || typeof change !== "number" || typeof changePct !== "number") {
          return null;
        }
        const cleanSymbol = (q.symbol ?? "").replace(/\.NS$/, "");
        return {
          symbol: cleanSymbol,
          name: q.shortName ?? q.longName ?? cleanSymbol,
          price,
          change,
          changePercent: changePct,
          currency: q.currency ?? "INR",
        };
      })
      .filter((x): x is TickerSymbol => x !== null);

    return mapped.length > 0 ? mapped : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const fetched = await fetchFromYahoo();
  const symbols = fetched ?? FALLBACK_SYMBOLS;

  return NextResponse.json(
    {
      fallback: fetched === null,
      fetchedAt: new Date().toISOString(),
      symbols,
    },
    {
      status: 200,
      headers: {
        // Edge cache for 15s, allow stale for 60s.
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    },
  );
}
