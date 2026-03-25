import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Toolbox - Developer Utilities"
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
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            width: 48,
            height: 4,
            background: "#e8603c",
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontSize: 96,
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
            fontSize: 28,
            color: "#a0a0a0",
            marginTop: 20,
          }}
        >
          Sharp utilities for everyday dev tasks
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 48,
            fontSize: 18,
            color: "#707070",
          }}
        >
          <span>Timezone</span>
          <span>·</span>
          <span>Base64</span>
          <span>·</span>
          <span>URI</span>
          <span>·</span>
          <span>Query String</span>
          <span>·</span>
          <span>Schengen</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
