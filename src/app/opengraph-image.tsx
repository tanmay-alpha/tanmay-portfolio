import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tanmay Mangal — AI/ML Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraph() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span
            style={{
              color: "#71717A",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            tanmaymangal.portfolio / 2026
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: "#D97757",
                display: "block",
              }}
            />
            <span
              style={{
                color: "#A1A1AA",
                fontSize: 24,
                letterSpacing: 4,
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              Open to work
            </span>
          </span>
        </div>

        {/* Center: name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: 40,
          }}
        >
          <span
            style={{
              color: "#A1A1AA",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            AI/ML · Full-stack · Quant-adjacent
          </span>
          <span
            style={{
              color: "#FAFAF7",
              fontSize: 144,
              fontStyle: "italic",
              lineHeight: 0.95,
              letterSpacing: -3,
              fontFamily: "Georgia, serif",
              fontWeight: 300,
            }}
          >
            Tanmay Mangal
          </span>
          <span
            style={{
              color: "#A1A1AA",
              fontSize: 36,
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              marginTop: 8,
            }}
          >
            <span style={{ color: "#D97757", marginRight: 12 }}>—</span>
            Build to understand. Trade to learn. Ship to compound.
          </span>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#71717A",
            fontSize: 22,
            fontFamily: "monospace",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>mangaltanmay7@gmail.com</span>
          <span>github.com/tanmay-alpha</span>
        </div>
      </div>
    ),
    size,
  );
}
