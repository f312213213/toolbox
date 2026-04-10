"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Quote, Copy, Check, Trash2, ArrowUpDown } from "lucide-react"

export default function JsonStringifyPage() {
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [lastOperation, setLastOperation] = useState<"stringify" | "parse" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isMac, setIsMac] = useState<boolean>(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  const stringify = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("Paste a value to stringify")
        return
      }
      // First parse to validate it's valid JSON, then stringify the result to escape it
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(JSON.stringify(parsed)))
      setLastOperation("stringify")
      setError(null)
    } catch {
      // If it's not valid JSON, treat the raw input as a plain string and stringify it
      setOutput(JSON.stringify(input))
      setLastOperation("stringify")
      setError(null)
    }
  }, [input])

  const parse = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("Paste a stringified value to parse")
        return
      }
      const parsed = JSON.parse(input)
      if (typeof parsed === "string") {
        // Try to parse the inner string as JSON for pretty output
        try {
          const inner = JSON.parse(parsed)
          setOutput(JSON.stringify(inner, null, 2))
        } catch {
          setOutput(parsed)
        }
      } else {
        setOutput(JSON.stringify(parsed, null, 2))
      }
      setLastOperation("parse")
      setError(null)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(`Cannot parse: ${e.message}`)
      } else {
        setError("Failed to parse input")
      }
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
    setLastOperation(null)
    setError(null)
  }, [])

  const swapInputOutput = useCallback(() => {
    if (!output) return
    setInput(output)
    setOutput("")
    setLastOperation(null)
    setError(null)
  }, [output])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const modifierKey = e.metaKey || e.ctrlKey
      if (e.key === "Enter" && modifierKey && !e.shiftKey) {
        e.preventDefault()
        stringify()
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault()
        parse()
      }
    },
    [stringify, parse]
  )

  const modKey = isMac ? "⌘" : "Ctrl"

  return (
    <div className="container mx-auto max-w-4xl px-6 py-14 space-y-8" data-stagger>
      <div className="space-y-3 animate-fade-up">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Quote className="size-8 text-primary" />
          JSON Stringify / Parse
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Escape JSON into a string, or unwrap a stringified JSON back out.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>
            JSON to stringify, or a stringified JSON string to parse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={'{"key": "value"}\nor\n"{\\"key\\": \\"value\\"}"'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-40 font-mono resize-y text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={stringify} className="flex-1 sm:flex-none">
              Stringify
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                {modKey}+Enter
              </Badge>
            </Button>
            <Button onClick={parse} variant="secondary" className="flex-1 sm:flex-none">
              Parse
              <Badge variant="outline" className="ml-2 hidden sm:inline-flex">
                Shift+Enter
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Output</span>
            {lastOperation && (
              <Badge variant={lastOperation === "stringify" ? "default" : "secondary"}>
                {lastOperation === "stringify" ? "Stringified" : "Parsed"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Result appears here"
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
            <Button onClick={swapInputOutput} variant="outline" disabled={!output} className="flex-1 sm:flex-none">
              <ArrowUpDown className="size-4 mr-2" />
              Use as Input
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
          <p>• <strong>{modKey}+Enter</strong> to stringify, <strong>Shift+Enter</strong> to parse</p>
          <p>• <strong>Stringify</strong> wraps JSON in an escaped string — great for embedding in configs or API payloads</p>
          <p>• <strong>Parse</strong> unwraps escaped JSON strings — chain multiple times for deeply escaped values</p>
          <p>• Use &quot;Use as Input&quot; to repeatedly parse nested stringified JSON</p>
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
