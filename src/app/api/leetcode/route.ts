import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEETCODE_URL = "https://alfa-leetcode-api.onrender.com/tanmay-alpha/solved";

export async function GET() {
  const fallbackPayload = {
    totalSolved: null as number | null,
    easySolved: null as number | null,
    mediumSolved: null as number | null,
    hardSolved: null as number | null,
    ranking: null as number | null,
    fetchedAt: new Date().toISOString(),
    fallback: true,
  };

  try {
    const res = await fetch(LEETCODE_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(fallbackPayload, { status: 200 });
    }

    const data = await res.json();

    const totalSolved = typeof data.solvedProblem === "number" ? data.solvedProblem : null;
    const easySolved = typeof data.easySolved === "number" ? data.easySolved : null;
    const mediumSolved = typeof data.mediumSolved === "number" ? data.mediumSolved : null;
    const hardSolved = typeof data.hardSolved === "number" ? data.hardSolved : null;

    if (totalSolved === null) {
      return NextResponse.json(fallbackPayload, { status: 200 });
    }

    return NextResponse.json(
      {
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking: null,
        fetchedAt: new Date().toISOString(),
        fallback: false,
      },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      },
    );
  } catch {
    return NextResponse.json(fallbackPayload, { status: 200 });
  }
}
