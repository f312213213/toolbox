import type { Metadata } from "next"
import { ToolJsonLd } from "@/lib/json-ld"

export const metadata: Metadata = {
  title: "URI Encoder/Decoder",
  description: "Encode and decode URI strings with percent-encoding. Toggle between encodeURIComponent and encodeURI modes to see the difference.",
  keywords: ["uri encoder", "uri decoder", "url encoder", "url decoder", "encodeURI", "encodeURIComponent", "percent encoding", "online url encoder"],
  openGraph: {
    title: "URI Encoder/Decoder",
    description: "Encode and decode URI strings with percent-encoding. Compare encodeURIComponent vs encodeURI side by side.",
  },
}

export default function URILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ToolJsonLd
        name="URI Encoder/Decoder"
        description="Encode and decode URI strings with percent-encoding. Compare encodeURIComponent vs encodeURI."
        path="/uri"
      />
      {children}
    </>
  )
}
