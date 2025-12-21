import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Wrench } from "lucide-react"

const tools = [
  {
    name: "Timezone Converter",
    description: "Convert time across different timezones easily",
    href: "/timezone",
    icon: Clock,
  },
  // Add more tools here as you build them
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