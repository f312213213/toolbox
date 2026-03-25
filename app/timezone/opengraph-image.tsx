import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Timezone Converter"
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    title: "Timezone Converter",
    description: "Pick a time in one timezone, see it in others. 100+ cities supported.",
  })
}
