import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Toolbox — Free Online Developer Utilities & Converters"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
        }}
      >
        {/* Top: accent bar */}
        <div
          style={{
            width: 48,
            height: 4,
            background: "#e8603c",
          }}
        />

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#f5f5f5",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            Tool
            <span style={{ color: "#e8603c" }}>box</span>
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#c0c0c0",
              marginTop: 16,
              fontWeight: 500,
            }}
          >
            Free Developer Utilities & Converters
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 28,
              fontSize: 18,
              color: "#808080",
            }}
          >
            <span>Timezone</span>
            <span>·</span>
            <span>Base64</span>
            <span>·</span>
            <span>URI Encoder</span>
            <span>·</span>
            <span>Query String</span>
            <span>·</span>
            <span>Schengen</span>
          </div>
        </div>

        {/* Bottom: CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#e8603c",
              fontWeight: 600,
            }}
          >
            Try free →
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#a0a0a0",
            }}
          >
            toolbox.chiendavid.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
