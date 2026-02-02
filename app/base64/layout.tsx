import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder",
  description: "Encode and decode Base64 strings easily. Supports Unicode characters including Chinese, Japanese, and emoji.",
  keywords: ["base64", "encoder", "decoder", "base64 encode", "base64 decode", "text encoding", "unicode"],
}

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
