import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Schengen Visa Calculator"
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    title: "Schengen Visa Calculator",
    description: "Calculate your remaining visa-free days using the 90/180 rule. Track trips and plan travel.",
  })
}
