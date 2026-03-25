import type { Metadata } from "next"
import { ToolJsonLd } from "@/lib/json-ld"

export const metadata: Metadata = {
  title: "Query String Visualizer",
  description: "Parse and inspect URL query parameters. Break apart URLs into editable key-value pairs, modify parameters, and rebuild the URL.",
  keywords: ["query string parser", "url params", "query string visualizer", "url query editor", "url parameter parser", "online url parser"],
  openGraph: {
    title: "Query String Visualizer",
    description: "Parse and inspect URL query parameters. Break apart URLs into editable key-value pairs and rebuild them.",
  },
}

export default function QueryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ToolJsonLd
        name="Query String Visualizer"
        description="Parse and inspect URL query parameters. Break apart URLs into editable key-value pairs."
        path="/query"
      />
      {children}
    </>
  )
}
