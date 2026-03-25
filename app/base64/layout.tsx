import type { Metadata } from "next"
import { ToolJsonLd } from "@/lib/json-ld"

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder",
  description: "Encode and decode Base64 strings online. Full Unicode support including Chinese, Japanese, Korean, and emoji characters.",
  keywords: ["base64", "encoder", "decoder", "base64 encode", "base64 decode", "text encoding", "unicode", "online base64"],
  openGraph: {
    title: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings online. Full Unicode support including CJK and emoji.",
  },
}

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ToolJsonLd
        name="Base64 Encoder/Decoder"
        description="Encode and decode Base64 strings online with full Unicode support."
        path="/base64"
      />
      {children}
    </>
  )
}
