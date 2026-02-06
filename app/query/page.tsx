"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Copy, Trash2 } from "lucide-react"

function parseQuery(url: string) {
  try {
    let q = url || ""
    const idx = url.indexOf("?")
    if (idx >= 0) {
      q = url.slice(idx + 1)
    }
    // remove hash
    const hashIdx = q.indexOf("#")
    if (hashIdx >= 0) q = q.slice(0, hashIdx)

    const params = new URLSearchParams(q)
    const out: Array<{ key: string; value: string }> = []
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
  const [rows, setRows] = useState<Array<{ key: string; value: string }>>([])
  const [baseUrl, setBaseUrl] = useState<string>("")

  // When user clicks Parse, populate rows and baseUrl
  const handleParse = () => {
    if (!input) {
      setRows([])
      setBaseUrl("")
      return
    }
    try {
      const idx = input.indexOf("?")
      if (idx >= 0) {
        setBaseUrl(input.slice(0, idx))
      } else {
        setBaseUrl("")
      }
    } catch (e) {
      setBaseUrl("")
    }
    setRows(parseQuery(input))
  }

  useEffect(() => {
    // auto-parse when input changes (but preserve empty input behavior)
    if (input.trim() === "") {
      setRows([])
      setBaseUrl("")
      return
    }
    // don't auto-parse on every keystroke to avoid interrupting edits; user can press Parse
  }, [input])

  const buildQuery = () => {
    const sp = new URLSearchParams()
    rows.forEach((r) => sp.append(r.key, r.value))
    return sp.toString()
  }

  const buildFull = () => {
    const q = buildQuery()
    if (!q) return baseUrl || ""
    if (baseUrl) return `${baseUrl}?${q}`
    return `?${q}`
  }

  const addRow = () => setRows([...rows, { key: "", value: "" }])
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index))
  const updateRow = (index: number, field: "key" | "value", value: string) => {
    const copy = rows.slice()
    copy[index] = { ...copy[index], [field]: value }
    setRows(copy)
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
          <div className="flex gap-2">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com/path?foo=1&bar=2#hash" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleParse}>Parse</Button>
            <Button variant="ghost" onClick={() => { setInput(""); setRows([]); setBaseUrl("") }}><Trash2 className="size-4 mr-2"/>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
          <CardDescription>Parsed key-value pairs (editable)</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-muted-foreground">No parameters found — click Parse or add one</div>
          ) : (
            <div>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="text-left w-1/3">Key</th>
                    <th className="text-left w-2/3">Value</th>
                    <th className="w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.key}-${i}`}>
                      <td className="align-top py-2 pr-4">
                        <input className="w-full bg-transparent outline-none" value={r.key} onChange={(e) => updateRow(i, "key", e.target.value)} />
                      </td>
                      <td className="align-top py-2 pr-4">
                        <input className="w-full bg-transparent outline-none" value={r.value} onChange={(e) => updateRow(i, "value", e.target.value)} />
                      </td>
                      <td className="align-top py-2 pr-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => removeRow(i)}>Remove</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => {
                  navigator.clipboard.writeText(buildQuery())
                  toast.success("Query copied to clipboard!")
                }}><Copy className="size-4 mr-2"/>Copy query</Button>
                <Button onClick={() => {
                  navigator.clipboard.writeText(buildFull())
                  toast.success("Full URL copied to clipboard!")
                }} variant="outline">Copy full URL</Button>
                <Button onClick={addRow} variant="ghost">Add param</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono break-words">
            {buildFull() ? buildFull() : <span className="text-muted-foreground">Your reconstructed URL will appear here</span>}
          </div>
        </CardContent>
      </Card>

      <Link href="/">
        <Button variant="outline" className="fixed bottom-6 right-6">Back to Home</Button>
      </Link>
    </div>
  )
}
