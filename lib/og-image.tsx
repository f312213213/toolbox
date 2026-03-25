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
            color: "#a0a0a0",
            marginTop: 24,
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 48,
            fontSize: 20,
            color: "#707070",
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#f5f5f5",
              letterSpacing: "-0.04em",
            }}
          >
            Tool<span style={{ color: "#e8603c" }}>box</span>
          </span>
        </div>
      </div>
    ),
    { ...ogSize }
  )
}
