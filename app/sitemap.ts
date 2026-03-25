import type { MetadataRoute } from "next"

const SITE_URL = "https://tool.chiendavid.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = ["/timezone", "/base64", "/uri", "/query", "/schengen"]

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: `${SITE_URL}${tool}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
