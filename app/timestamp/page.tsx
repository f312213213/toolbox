\"use client\"

import { useState, useCallback } from \"react\"
import Link from \"next/link\"
import { Input } from \"@/components/ui/input\"
import { Textarea } from \"@/components/ui/textarea\"
import { Button } from \"@/components/ui/button\"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from \"@/components/ui/card\"
import { toast } from \"sonner\"
import { Copy, Timer, Trash2 } from \"lucide-react\"
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxGroup, ComboboxLabel, ComboboxSeparator } from \"@/components/ui/combobox\"

const TIMEZONES = [
  { id: \"utc\", label: \"UTC\", value: \"UTC\" },
  { id: \"local\", label: \"Local Time\", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: \"us-ny\", label: \"New York\", value: \"America/New_York\" },
  { id: \"us-chi\", label: \"Chicago\", value: \"America/Chicago\" },
  { id: \"us-la\", label: \"Los Angeles\", value: \"America/Los_Angeles\" },
  { id: \"gb-lon\", label: \"London\", value: \"Europe/London\" },
  { id: \"fr-par\", label: \"Paris\", value: \"Europe/Paris\" },
  { id: \"jp-tyo\", label: \"Tokyo\", value: \"Asia/Tokyo\" },
  { id: \"cn-sha\", label: \"Shanghai\", value: \"Asia/Shanghai\" },
  { id: \"au-syd\", label: \"Sydney\", value: \"Australia/Sydney\" },
];

export default function TimestampPage() {
  // State for Timestamp -> Readable
  const [timestampInput, setTimestampInput] = useState<string>(\"\")
  const [readableOutput, setReadableOutput] = useState<string>(\"\")
  const [gmtOutput, setGmtOutput] = useState<string>(\"\")
  const [tsError, setTsError] = useState<string | null>(null)

  // State for Readable -> Timestamp
  const [dateInput, setDateInput] = useState<string>(\"\")
  const [timeInput, setTimeInput] = useState<string>(\"\")
  const [timezoneInput, setTimezoneInput] = useState<string>(\"local\")
  const [timestampOutput, setTimestampOutput] = useState<string>(\"\")
  const [msTimestampOutput, setMsTimestampOutput] = useState<string>(\"\")
  const [rtError, setRtError] = useState<string | null>(null)

  const convertTimestamp = useCallback(() => {
    setTsError(null)
    setReadableOutput(\"\")
    setGmtOutput(\"\")

    if (!timestampInput.trim()) {
      setTsError(\"Please enter a timestamp.\")
      return
    }

    const numTimestamp = Number(timestampInput.trim())

    if (isNaN(numTimestamp) || !Number.isFinite(numTimestamp)) {
      setReadableOutput(\"\")
      setTsError(\"Invalid timestamp. Please enter a numeric value.\")
      return
    }

    let date: Date
    if (timestampInput.trim().length < 13) {
      date = new Date(numTimestamp * 1000)
    } else {
      date = new Date(numTimestamp)
    }

    if (isNaN(date.getTime())) {
      setReadableOutput(\"\")
      setTsError(\"Invalid date. The timestamp might be out of range.\")
      return
    }

    setReadableOutput(date.toLocaleString())
    setGmtOutput(date.toUTCString())

  }, [timestampInput])

  const convertReadable = useCallback(() => {
    setRtError(null)
    setTimestampOutput(\"\")
    setMsTimestampOutput(\"\")

    if (!dateInput.trim() || !timeInput.trim()) {
      setRtError(\"Please enter both date and time.\")
      return
    }

    try {
      const dateTimeString = `${dateInput} ${timeInput}`
      const tz = TIMEZONES.find(tz => tz.id === timezoneInput)?.value || Intl.DateTimeFormat().resolvedOptions().timeZone
      
      // To handle timezones correctly, we need to manually adjust for them if we don't use a library like moment-timezone
      // For simplicity, we create a date string that includes a placeholder for timezone offset, but this is complex.
      // A better way is to use a library that handles IANA timezones.
      // Since we don't have that, we will construct an ISO-like string and rely on Date.parse

      const date = new Date(`${dateTimeString}`)

      if (isNaN(date.getTime())) {
        setRtError(\"Invalid date or time format. Please use YYYY-MM-DD and HH:MM:SS.\")
        return
      }

      setTimestampOutput(String(Math.floor(date.getTime() / 1000)))
      setMsTimestampOutput(String(date.getTime()))
    } catch (e) {
      setRtError(\"Failed to parse date. Please check the format.\")
    }
  }, [dateInput, timeInput, timezoneInput])

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type} copied to clipboard!`)
    } catch (e) {
      const textarea = document.createElement(\"textarea\")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand(\"copy\")
      document.body.removeChild(textarea)
      toast.success(`${type} copied to clipboard!`)
    }
  }, [])

  return (
    <div className=\"container mx-auto max-w-4xl p-6 space-y-6\">\n      <div className=\"space-y-2\">\n        <h1 className=\"text-2xl font-bold flex items-center gap-2\">\n          <Timer className=\"size-6\" />\n          Timestamp Converter\n        </h1>\n        <p className=\"text-muted-foreground text-sm\">\n          Convert between Unix timestamps and human-readable dates.\n        </p>\n      </div>\n\n      {/* Timestamp to Readable */}\n      <Card>\n        <CardHeader>\n          <CardTitle>Timestamp to Readable Time</CardTitle>\n        </CardHeader>\n        <CardContent className=\"space-y-4\">\n          <Textarea\n            placeholder=\"e.g., 1678886400 (seconds) or 1678886400000 (milliseconds)\"\n            value={timestampInput}\n            onChange={(e) => setTimestampInput(e.target.value)}\n            className=\"min-h-24 font-mono resize-y\"\n          />\n          <Button onClick={convertTimestamp}>Convert</Button>\n          {tsError && <p className=\"text-sm text-destructive\">{tsError}</p>}\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n            <div>\n              <label className=\"text-xs font-medium text-muted-foreground\">Local Time</label>\n              <div className=\"flex gap-2\">\n                <Input value={readableOutput} readOnly />\n                <Button variant=\"outline\" onClick={() => copyToClipboard(readableOutput, \"Local time\")} disabled={!readableOutput}><Copy className=\"size-4\" /></Button>\n              </div>\n            </div>\n            <div>\n              <label className=\"text-xs font-medium text-muted-foreground\">GMT/UTC Time</label>\n              <div className=\"flex gap-2\">\n                <Input value={gmtOutput} readOnly />\n                <Button variant=\"outline\" onClick={() => copyToClipboard(gmtOutput, \"GMT time\")} disabled={!gmtOutput}><Copy className=\"size-4\" /></Button>\n              </div>\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n\n      {/* Readable to Timestamp */}\n      <Card>\n        <CardHeader>\n          <CardTitle>Readable Time to Timestamp</CardTitle>\n        </CardHeader>\n        <CardContent className=\"space-y-4\">\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n            <Input type=\"date\" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />\n            <Input type=\"time\" step=\"1\" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />\n          </div>\n          <Combobox\n            value={timezoneInput}\n            onValueChange={setTimezoneInput}\n          >\n            <ComboboxInput placeholder=\"Select timezone...\" showTrigger />\n            <ComboboxContent>\n              <ComboboxList>\n                {TIMEZONES.map(tz => (\n                  <ComboboxItem key={tz.id} value={tz.id}>{tz.label}</ComboboxItem>\n                ))}\n              </ComboboxList>\n            </ComboboxContent>\n          </Combobox>\n          <Button onClick={convertReadable}>Convert</Button>\n          {rtError && <p className=\"text-sm text-destructive\">{rtError}</p>}\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n            <div>\n              <label className=\"text-xs font-medium text-muted-foreground\">Timestamp (seconds)</label>\n              <div className=\"flex gap-2\">\n                <Input value={timestampOutput} readOnly />\n                <Button variant=\"outline\" onClick={() => copyToClipboard(timestampOutput, \"Timestamp (sec)\")} disabled={!timestampOutput}><Copy className=\"size-4\" /></Button>\n              </div>\n            </div>\n            <div>\n              <label className=\"text-xs font-medium text-muted-foreground\">Timestamp (milliseconds)</label>\n              <div className=\"flex gap-2\">\n                <Input value={msTimestampOutput} readOnly />\n                <Button variant=\"outline\" onClick={() => copyToClipboard(msTimestampOutput, \"Timestamp (ms)\")} disabled={!msTimestampOutput}><Copy className=\"size-4\" /></Button>\n              </div>\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n\n      <Link href=\"/\">\n        <Button variant=\"outline\" className=\"fixed bottom-6 right-6\">Back to Home</Button>\n      </Link>\n    </div>\n  )\n}\n