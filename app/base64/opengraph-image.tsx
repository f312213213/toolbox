import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Base64 Encoder/Decoder"
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    title: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings with full Unicode support — emoji, CJK, and all.",
  })
}
