"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link2, ArrowDown, Copy, Trash2, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type EncodingMode = "uri" | "uriComponent"

export default function URIPage() {
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [lastOperation, setLastOperation] = useState<"encode" | "decode" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isMac, setIsMac] = useState<boolean>(false)
  const [mode, setMode] = useState<EncodingMode>("uriComponent")

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
      const encoded = mode === "uriComponent" 
        ? encodeURIComponent(input)
        : encodeURI(input)
      setOutput(encoded)
      setLastOperation("encode")
      setError(null)
    } catch (e) {
      setError("Encoding failed: " + (e instanceof Error ? e.message : "Unknown error"))
    }
  }, [input, mode])

  const decode = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("Please enter URI string to decode")
        return
      }
      const decoded = mode === "uriComponent"
        ? decodeURIComponent(input.trim())
        : decodeURI(input.trim())
      setOutput(decoded)
      setLastOperation("decode")
      setError(null)
    } catch (e) {
      setError("Decoding failed: Invalid URI string (malformed URI sequence)")
    }
  }, [input, mode])

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
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="size-6" />
          URI Encoder/Decoder
        </h1>
        <p className="text-muted-foreground text-sm">
          Encode and decode URI strings with percent-encoding
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>
            Enter text to encode or URI string to decode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Encoding Mode</label>
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("uriComponent")}
                className={cn(
                  "rounded-md transition-all",
                  mode === "uriComponent" 
                    ? "bg-background shadow-sm" 
                    : "hover:bg-transparent"
                )}
              >
                encodeURIComponent
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("uri")}
                className={cn(
                  "rounded-md transition-all",
                  mode === "uri" 
                    ? "bg-background shadow-sm" 
                    : "hover:bg-transparent"
                )}
              >
                encodeURI
              </Button>
            </div>
          </div>

          <Textarea
            placeholder="Enter text here..."
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

      <div className="flex justify-center">
        <ArrowDown className="size-6 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Output</span>
            <div className="flex items-center gap-2">
              {lastOperation && (
                <Badge variant={lastOperation === "encode" ? "default" : "secondary"}>
                  {lastOperation === "encode" ? "Encoded" : "Decoded"}
                </Badge>
              )}
              {lastOperation && (
                <Badge variant="outline">
                  {mode === "uriComponent" ? "Component" : "URI"}
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            {lastOperation === "encode"
              ? `URI encoded result (${mode === "uriComponent" ? "encodeURIComponent" : "encodeURI"})`
              : lastOperation === "decode"
              ? `Decoded text result (${mode === "uriComponent" ? "decodeURIComponent" : "decodeURI"})`
              : "Result will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Output will appear here..."
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
            <Button onClick={copyOutput} variant="outline" className="flex-1 sm:flex-none">
              <Copy className="size-4 mr-2" />
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
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>{modKey}+Enter</strong> to encode, <strong>Shift+Enter</strong> to decode</p>
          <div className="mt-3 space-y-2">
            <p className="font-medium text-foreground">encodeURIComponent vs encodeURI:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>encodeURIComponent</strong> — Encodes everything except: <code className="bg-muted px-1 rounded">A-Z a-z 0-9 - _ . ! ~ * &apos; ( )</code></li>
              <li><strong>encodeURI</strong> — Preserves URI structure, keeps: <code className="bg-muted px-1 rounded">: / ? # [ ] @ ! $ &amp; &apos; ( ) * + , ; =</code></li>
            </ul>
          </div>
          <p className="mt-2">• Use <strong>encodeURIComponent</strong> for query parameters</p>
          <p>• Use <strong>encodeURI</strong> for full URLs</p>
        </CardContent>
      </Card>

      {/* Floating back to home button */}
      <Link href="/">
        <Button
          variant="outline"
          className="fixed bottom-6 right-6"
        >
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
