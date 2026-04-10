"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Braces, Copy, Check, Trash2, Minimize2 } from "lucide-react"

export default function JsonPage() {
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [indent, setIndent] = useState<number>(2)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isMac, setIsMac] = useState<boolean>(false)
  const [stats, setStats] = useState<{ keys: number; depth: number } | null>(null)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  const getDepth = (obj: unknown, current = 0): number => {
    if (obj === null || typeof obj !== "object") return current
    const children = Array.isArray(obj) ? obj : Object.values(obj)
    if (children.length === 0) return current + 1
    return Math.max(...children.map((v) => getDepth(v, current + 1)))
  }

  const countKeys = (obj: unknown): number => {
    if (obj === null || typeof obj !== "object") return 0
    if (Array.isArray(obj)) return obj.reduce((sum, v) => sum + countKeys(v), 0)
    return Object.keys(obj).length + Object.values(obj).reduce((sum: number, v) => sum + countKeys(v), 0)
  }

  const format = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("Paste some JSON to format")
        return
      }
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setStats({ keys: countKeys(parsed), depth: getDepth(parsed) })
      setError(null)
    } catch (e) {
      if (e instanceof SyntaxError) {
        const match = e.message.match(/position (\d+)/)
        const pos = match ? parseInt(match[1]) : null
        const hint = pos !== null ? ` (near character ${pos})` : ""
        setError(`Invalid JSON${hint}: ${e.message}`)
      } else {
        setError("Failed to parse JSON")
      }
      setStats(null)
    }
  }, [input, indent])

  const minify = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("Paste some JSON to minify")
        return
      }
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setStats({ keys: countKeys(parsed), depth: getDepth(parsed) })
      setError(null)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(`Invalid JSON: ${e.message}`)
      } else {
        setError("Failed to parse JSON")
      }
      setStats(null)
    }
  }, [input])

  const copyOutput = useCallback(async () => {
    if (!output) {
      setError("Nothing to copy")
      return
    }
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = output
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [output])

  const clearAll = useCallback(() => {
    setInput("")
    setOutput("")
    setError(null)
    setStats(null)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const modifierKey = e.metaKey || e.ctrlKey
      if (e.key === "Enter" && modifierKey && !e.shiftKey) {
        e.preventDefault()
        format()
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault()
        minify()
      }
    },
    [format, minify]
  )

  const modKey = isMac ? "⌘" : "Ctrl"

  return (
    <div className="container mx-auto max-w-4xl px-6 py-14 space-y-8" data-stagger>
      <div className="space-y-3 animate-fade-up">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Braces className="size-8 text-primary" />
          JSON Formatter
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Beautify, validate, and minify JSON with instant feedback.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>Paste raw or minified JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='{"name": "value", "nested": {"key": [1,2,3]}}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-40 font-mono resize-y text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={format} className="flex-1 sm:flex-none">
              Format
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                {modKey}+Enter
              </Badge>
            </Button>
            <Button onClick={minify} variant="secondary" className="flex-1 sm:flex-none">
              <Minimize2 className="size-4 mr-2" />
              Minify
              <Badge variant="outline" className="ml-2 hidden sm:inline-flex">
                Shift+Enter
              </Badge>
            </Button>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-sm text-muted-foreground">Indent:</span>
              {[2, 4].map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={indent === n ? "default" : "outline"}
                  onClick={() => setIndent(n)}
                  className="px-2.5 h-8 text-xs"
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Output</span>
            {stats && (
              <div className="flex gap-2">
                <Badge variant="secondary">{stats.keys} keys</Badge>
                <Badge variant="outline">depth {stats.depth}</Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Formatted JSON appears here"
            value={output}
            readOnly
            className="min-h-40 font-mono resize-y text-sm"
          />
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyOutput} variant="outline" disabled={!output} className="flex-1 sm:flex-none">
              {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button onClick={clearAll} variant="ghost" className="flex-1 sm:flex-none">
              <Trash2 className="size-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>{modKey}+Enter</strong> to format, <strong>Shift+Enter</strong> to minify</p>
          <p>• Toggle between 2-space and 4-space indentation</p>
          <p>• Shows key count and nesting depth for quick inspection</p>
        </CardContent>
      </Card>

      <Link href="/" className="animate-fade-in stagger-3">
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 font-semibold"
        >
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
