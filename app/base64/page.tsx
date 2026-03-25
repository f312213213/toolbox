"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Binary, Copy, Check, Trash2, ArrowUpDown } from "lucide-react"

export default function Base64Page() {
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [lastOperation, setLastOperation] = useState<"encode" | "decode" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isMac, setIsMac] = useState<boolean>(false)

  // Detect OS on mount
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  const encode = useCallback(() => {
    try {
      if (!input) {
        setError("Please enter text to encode")
        return
      }
      // Handle Unicode properly
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setLastOperation("encode")
      setError(null)
    } catch (e) {
      setError("Encoding failed: " + (e instanceof Error ? e.message : "Unknown error"))
    }
  }, [input])

  const decode = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("Please enter Base64 string to decode")
        return
      }
      // Handle Unicode properly
      const decoded = decodeURIComponent(escape(atob(input.trim())))
      setOutput(decoded)
      setLastOperation("decode")
      setError(null)
    } catch (e) {
      setError("Not a valid Base64 string. Check for extra spaces or missing characters.")
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
    } catch (e) {
      // Fallback for older browsers
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
        encode()
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault()
        decode()
      }
    },
    [encode, decode]
  )

  const modKey = isMac ? "⌘" : "Ctrl"

  return (
    <div className="container mx-auto max-w-4xl px-6 py-14 space-y-8" data-stagger>
      <div className="space-y-3 animate-fade-up">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Binary className="size-8 text-primary" />
          Base64 Encoder/Decoder
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Encode and decode Base64 strings with full Unicode support.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>
            Plain text or a Base64 string
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste text or Base64 string..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-32 font-mono resize-y"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={encode} className="flex-1 sm:flex-none">
              Encode
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                {modKey}+Enter
              </Badge>
            </Button>
            <Button onClick={decode} variant="secondary" className="flex-1 sm:flex-none">
              Decode
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
              <Badge variant={lastOperation === "encode" ? "default" : "secondary"}>
                {lastOperation === "encode" ? "Encoded" : "Decoded"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Result appears here after encoding or decoding"
            value={output}
            readOnly
            className="min-h-32 font-mono resize-y"
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

      {/* Usage tips */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>{modKey}+Enter</strong> to encode, <strong>Shift+Enter</strong> to decode</p>
          <p>• Works with all Unicode characters (CJK, emoji, accented text)</p>
          <p>• Use &quot;Use as Input&quot; to chain encode/decode operations</p>
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
