import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image"

export const alt = "Query String Visualizer"
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return generateOgImage({
    title: "Query String Visualizer",
    description: "Break apart URLs into editable key-value pairs, modify parameters, and rebuild the URL.",
  })
}
