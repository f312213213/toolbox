import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Binary, Link2, Search, Timer } from "lucide-react"

const tools = [
  {
    name: "Timezone Converter",
    description: "Convert time across different timezones easily",
    href: "/timezone",
    icon: Clock,
  },
  {
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings with Unicode support",
    href: "/base64",
    icon: Binary,
  },
  {
    name: "URI Encoder/Decoder",
    description: "Encode and decode URI strings with percent-encoding",
    href: "/uri",
    icon: Link2,
  },
  {
    name: "Query String Visualizer",
    description: "Parse and inspect URL query parameters",
    href: "/query",
    icon: Search,
  },
  {
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and times",
    href: "/timestamp",
    icon: Timer,
  },
]

export default function Page() {
  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl flex items-center gap-2">
          Toolbox
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="size-5" />
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}