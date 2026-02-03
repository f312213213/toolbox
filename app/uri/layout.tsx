import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "URI Encoder/Decoder",
  description: "Encode and decode URI strings easily. Supports both encodeURI/decodeURI and encodeURIComponent/decodeURIComponent.",
  keywords: ["uri encoder", "uri decoder", "url encoder", "url decoder", "encodeURI", "decodeURI", "encodeURIComponent", "decodeURIComponent", "percent encoding"],
}

export default function URILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
