"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Diff, Copy, Check, Trash2 } from "lucide-react"

type DiffType = "added" | "removed" | "changed" | "unchanged"

interface DiffEntry {
  path: string
  type: DiffType
  left?: unknown
  right?: unknown
}

function diffJson(left: unknown, right: unknown, path = ""): DiffEntry[] {
  if (left === right) return []
  if (left === null || right === null || typeof left !== typeof right) {
    return [{ path: path || "(root)", type: "changed", left, right }]
  }
  if (typeof left !== "object") {
    return [{ path: path || "(root)", type: "changed", left, right }]
  }
  if (Array.isArray(left) !== Array.isArray(right)) {
    return [{ path: path || "(root)", type: "changed", left, right }]
  }

  const diffs: DiffEntry[] = []
  const leftObj = left as Record<string, unknown>
  const rightObj = right as Record<string, unknown>
  const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)])

  for (const key of allKeys) {
    const childPath = path ? (Array.isArray(left) ? `${path}[${key}]` : `${path}.${key}`) : key
    if (!(key in leftObj)) {
      diffs.push({ path: childPath, type: "added", right: rightObj[key] })
    } else if (!(key in rightObj)) {
      diffs.push({ path: childPath, type: "removed", left: leftObj[key] })
    } else if (
      typeof leftObj[key] === "object" &&
      leftObj[key] !== null &&
      typeof rightObj[key] === "object" &&
      rightObj[key] !== null
    ) {
      diffs.push(...diffJson(leftObj[key], rightObj[key], childPath))
    } else if (leftObj[key] !== rightObj[key]) {
      diffs.push({ path: childPath, type: "changed", left: leftObj[key], right: rightObj[key] })
    }
  }

  return diffs
}

function formatValue(v: unknown): string {
  if (typeof v === "string") return `"${v}"`
  return JSON.stringify(v)
}

export default function JsonDiffPage() {
  const [left, setLeft] = useState<string>("")
  const [right, setRight] = useState<string>("")
  const [diffs, setDiffs] = useState<DiffEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isMac, setIsMac] = useState<boolean>(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  const compare = useCallback(() => {
    if (!left.trim() || !right.trim()) {
      setError("Paste JSON in both panels to compare")
      setDiffs(null)
      return
    }
    let parsedLeft: unknown
    let parsedRight: unknown
    try {
      parsedLeft = JSON.parse(left)
    } catch (e) {
      setError(`Left panel: ${e instanceof SyntaxError ? e.message : "Invalid JSON"}`)
      setDiffs(null)
      return
    }
    try {
      parsedRight = JSON.parse(right)
    } catch (e) {
      setError(`Right panel: ${e instanceof SyntaxError ? e.message : "Invalid JSON"}`)
      setDiffs(null)
      return
    }
    const result = diffJson(parsedLeft, parsedRight)
    setDiffs(result)
    setError(null)
  }, [left, right])

  const stats = useMemo(() => {
    if (!diffs) return null
    return {
      added: diffs.filter((d) => d.type === "added").length,
      removed: diffs.filter((d) => d.type === "removed").length,
      changed: diffs.filter((d) => d.type === "changed").length,
    }
  }, [diffs])

  const copyDiff = useCallback(async () => {
    if (!diffs) return
    const text = diffs
      .map((d) => {
        if (d.type === "added") return `+ ${d.path}: ${formatValue(d.right)}`
        if (d.type === "removed") return `- ${d.path}: ${formatValue(d.left)}`
        return `~ ${d.path}: ${formatValue(d.left)} → ${formatValue(d.right)}`
      })
      .join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [diffs])

  const clearAll = useCallback(() => {
    setLeft("")
    setRight("")
    setDiffs(null)
    setError(null)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        compare()
      }
    },
    [compare]
  )

  const modKey = isMac ? "⌘" : "Ctrl"

  const typeColor: Record<DiffType, string> = {
    added: "text-green-400",
    removed: "text-red-400",
    changed: "text-yellow-400",
    unchanged: "text-muted-foreground",
  }

  const typeBg: Record<DiffType, string> = {
    added: "bg-green-400/10 border-green-400/20",
    removed: "bg-red-400/10 border-red-400/20",
    changed: "bg-yellow-400/10 border-yellow-400/20",
    unchanged: "",
  }

  const typeLabel: Record<DiffType, string> = {
    added: "+",
    removed: "−",
    changed: "~",
    unchanged: "",
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-14 space-y-8" data-stagger>
      <div className="space-y-3 animate-fade-up">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Diff className="size-8 text-primary" />
          JSON Diff
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Compare two JSON objects and see exactly what changed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Left</CardTitle>
            <CardDescription>Original / before</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='{"name": "Alice", "age": 30}'
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-48 font-mono resize-y text-sm"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Right</CardTitle>
            <CardDescription>Modified / after</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='{"name": "Alice", "age": 31, "city": "NYC"}'
              value={right}
              onChange={(e) => setRight(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-48 font-mono resize-y text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={compare} className="flex-1 sm:flex-none">
          Compare
          <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
            {modKey}+Enter
          </Badge>
        </Button>
        <Button onClick={clearAll} variant="ghost" className="flex-1 sm:flex-none">
          <Trash2 className="size-4 mr-2" />
          Clear
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {diffs !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Differences</span>
              <div className="flex gap-2">
                {stats && stats.added > 0 && (
                  <Badge className="bg-green-400/15 text-green-400 border-green-400/30">
                    +{stats.added} added
                  </Badge>
                )}
                {stats && stats.removed > 0 && (
                  <Badge className="bg-red-400/15 text-red-400 border-red-400/30">
                    −{stats.removed} removed
                  </Badge>
                )}
                {stats && stats.changed > 0 && (
                  <Badge className="bg-yellow-400/15 text-yellow-400 border-yellow-400/30">
                    ~{stats.changed} changed
                  </Badge>
                )}
                {diffs.length === 0 && (
                  <Badge variant="secondary">Identical</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {diffs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Both JSON values are identical.</p>
            ) : (
              <div className="space-y-1.5">
                {diffs.map((d, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-3 py-2 border font-mono text-sm ${typeBg[d.type]}`}
                  >
                    <span className={`font-bold shrink-0 w-4 text-center ${typeColor[d.type]}`}>
                      {typeLabel[d.type]}
                    </span>
                    <span className="text-muted-foreground shrink-0">{d.path}</span>
                    <span className="ml-auto text-right">
                      {d.type === "added" && (
                        <span className={typeColor.added}>{formatValue(d.right)}</span>
                      )}
                      {d.type === "removed" && (
                        <span className={`line-through ${typeColor.removed}`}>{formatValue(d.left)}</span>
                      )}
                      {d.type === "changed" && (
                        <>
                          <span className={`line-through ${typeColor.removed}`}>{formatValue(d.left)}</span>
                          <span className="text-muted-foreground mx-1.5">→</span>
                          <span className={typeColor.added}>{formatValue(d.right)}</span>
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {diffs.length > 0 && (
              <Button onClick={copyDiff} variant="outline" className="mt-2">
                {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
                {copied ? "Copied!" : "Copy Diff"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>{modKey}+Enter</strong> from either panel to compare</p>
          <p>• Diffs are shown by JSON path — nested changes display their full key path</p>
          <p>• <span className="text-green-400 font-mono">+</span> added, <span className="text-red-400 font-mono">−</span> removed, <span className="text-yellow-400 font-mono">~</span> changed</p>
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
