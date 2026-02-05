"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Copy, Trash2 } from "lucide-react"

function parseQuery(url: string) {
  try {
    // try to extract query string
    let q = url
    const idx = url.indexOf("?")
    if (idx >= 0) {
      q = url.slice(idx + 1)
    }
    // remove hash
    const hashIdx = q.indexOf("#")
    if (hashIdx >= 0) q = q.slice(0, hashIdx)

    const params = new URLSearchParams(q)
    const out: Array<{ key: string; value: string }>[] = []
    for (const [k, v] of params.entries()) {
      out.push({ key: k, value: v })
    }
    return out
  } catch (e) {
    return []
  }
}

export default function QueryPage() {
  const [input, setInput] = useState("")
  const rows = useMemo(() => parseQuery(input), [input])

  const build = () => {
    const sp = new URLSearchParams()
    rows.forEach((r: any) => sp.append(r.key, r.value))
    return sp.toString()
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Query String Visualizer</h1>
        <p className="text-muted-foreground text-sm">Paste a URL and inspect/edit query parameters</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL / Query string</CardTitle>
          <CardDescription>Paste a full URL or just the query string</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com/path?foo=1&bar=2#hash" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
          <CardDescription>Parsed key-value pairs</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-muted-foreground">No parameters found</div>
          ) : (
            <div>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="text-left">Key</th>
                    <th className="text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.key}-${i}`}>
                      <td className="align-top py-2 pr-4"><input className="w-full bg-transparent outline-none" defaultValue={r.key} /></td>
                      <td className="align-top py-2 pr-4"><input className="w-full bg-transparent outline-none" defaultValue={r.value} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => navigator.clipboard.writeText(build())}><Copy className="size-4 mr-2"/>Copy query</Button>
                <Button variant="ghost" onClick={() => setInput("")}><Trash2 className="size-4 mr-2"/>Clear</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/">
        <Button variant="outline" className="fixed bottom-6 right-6">Back to Home</Button>
      </Link>
    </div>
  )
}
