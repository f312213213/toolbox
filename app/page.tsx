import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Binary, Link2, Search, Plane, ArrowRight } from "lucide-react"

const SITE_URL = "https://toolbox.chiendavid.com"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toolbox",
  url: SITE_URL,
  description: "A collection of sharp utilities for everyday dev tasks.",
  author: {
    "@type": "Person",
    name: "David Chien",
  },
}

const tools = [
  {
    name: "Timezone Converter",
    description: "See any time in multiple zones at once",
    href: "/timezone",
    icon: Clock,
  },
  {
    name: "Base64 Encoder/Decoder",
    description: "Base64 with full Unicode — emoji, CJK, and all",
    href: "/base64",
    icon: Binary,
  },
  {
    name: "URI Encoder/Decoder",
    description: "encodeURI vs encodeURIComponent, side by side",
    href: "/uri",
    icon: Link2,
  },
  {
    name: "Query String Visualizer",
    description: "Break apart URLs into editable key-value pairs",
    href: "/query",
    icon: Search,
  },
  {
    name: "Schengen Visa Calculator",
    description: "Know exactly how many Schengen days you have left",
    href: "/schengen",
    icon: Plane,
  },
]

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <div className="px-6 pt-28 pb-20 animate-fade-up">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9]">
            Tool<span className="text-primary">box</span>
          </h1>
          <p className="text-muted-foreground text-xl mt-5 max-w-md font-light">
            Sharp utilities for everyday dev tasks.
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="container mx-auto max-w-4xl px-6 pb-24 flex-1">
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool, i) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className={`group relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer h-full animate-fade-up stagger-${i + 1}`}>
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                  <div className="absolute top-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500 ease-out" />
                  <CardHeader className="pb-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-primary/10 w-fit border border-primary/20">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <ArrowRight className="size-5 text-primary opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                    <CardTitle className="text-xl font-black mt-4 tracking-tight">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-sm">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
