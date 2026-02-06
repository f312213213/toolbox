"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Copy, Timer, Trash2 } from "lucide-react"

export default function TimestampPage() {
  const [timestampInput, setTimestampInput] = useState<string>("")
  const [readableOutput, setReadableOutput] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const convertTimestamp = useCallback(() => {
    setError(null)
    if (!timestampInput.trim()) {
      setReadableOutput("")
      setError("Please enter a timestamp.")
      return
    }

    const numTimestamp = Number(timestampInput.trim())

    if (isNaN(numTimestamp) || !Number.isFinite(numTimestamp)) {
      setReadableOutput("")
      setError("Invalid timestamp. Please enter a numeric value.")
      return
    }

    // Assume if the timestamp is roughly less than 13 digits, it's seconds.
    // Otherwise, it's milliseconds.
    // Current timestamp is ~1677273600 (10 digits) for seconds, ~1677273600000 (13 digits) for milliseconds.
    // We'll use 1000000000000 (13 digits, year ~2001) as a rough threshold for milliseconds.
    let date: Date
    if (timestampInput.trim().length < 13) {
      date = new Date(numTimestamp * 1000) // Convert seconds to milliseconds
    } else {
      date = new Date(numTimestamp)
    }

    if (isNaN(date.getTime())) {
      setReadableOutput("")
      setError("Invalid date. The timestamp might be out of range.")
      return
    }

    setReadableOutput(date.toLocaleString())
  }, [timestampInput])

  const copyOutput = useCallback(async () => {
    if (!readableOutput) {
      setError("Nothing to copy.")
      return
    }
    try {
      await navigator.clipboard.writeText(readableOutput)
      toast.success("Readable time copied to clipboard!")
    } catch (e) {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = readableOutput
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      toast.success("Readable time copied to clipboard!")
    }
  }, [readableOutput])

  const clearAll = useCallback(() => {
    setTimestampInput("")
    setReadableOutput("")
    setError(null)
  }, [])

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Timer className="size-6" />
          Timestamp Converter
        </h1>
        <p className="text-muted-foreground text-sm">
          Convert Unix timestamps to human-readable dates and times.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timestamp Input</CardTitle>
          <CardDescription>
            Enter a Unix timestamp (seconds or milliseconds since epoch)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., 1678886400 (seconds) or 1678886400000 (milliseconds)"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            className="min-h-32 font-mono resize-y"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={convertTimestamp} className="flex-1 sm:flex-none">
              Convert to Readable
            </Button>
            <Button onClick={clearAll} variant="ghost" className="flex-1 sm:flex-none">
              <Trash2 className="size-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Readable Date/Time</CardTitle>
          <CardDescription>
            The converted human-readable date and time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={error ? error : "Converted time will appear here..."}
            value={readableOutput}
            readOnly
            className="min-h-32 font-mono resize-y"
          />
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyOutput} variant="outline" className="flex-1 sm:flex-none" disabled={!readableOutput}>
              <Copy className="size-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

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
