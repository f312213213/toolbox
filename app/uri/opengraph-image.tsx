import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "URI Encoder/Decoder"
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    title: "URI Encoder/Decoder",
    description: "Percent-encode and decode URI strings. Compare encodeURIComponent vs encodeURI.",
  })
}
