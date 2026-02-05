import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Query String Visualizer",
  description: "Parse and visualize URL query parameters. Inspect, edit, and reconstruct query strings.",
  keywords: ["query string", "url params", "visualize query", "query parser"],
}

export default function QueryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
