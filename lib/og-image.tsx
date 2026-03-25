import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = "image/png"

interface OgImageProps {
  title: string
  description: string
}

export function generateOgImage({ title, description }: OgImageProps) {
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

        {/* Middle: headline + description */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#f5f5f5",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#c0c0c0",
              marginTop: 20,
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>

        {/* Bottom: branding + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#f5f5f5",
              letterSpacing: "-0.04em",
            }}
          >
            Tool<span style={{ color: "#e8603c" }}>box</span>
          </div>
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
      </div>
    ),
    { ...ogSize }
  )
}
