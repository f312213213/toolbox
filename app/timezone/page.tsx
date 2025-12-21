"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock, Plus, X, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Common timezones organized by region
const TIMEZONES = [
  { label: "UTC", value: "UTC" },
  { label: "Local Time", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: "America/New_York (EST)", value: "America/New_York" },
  { label: "America/Chicago (CST)", value: "America/Chicago" },
  { label: "America/Denver (MST)", value: "America/Denver" },
  { label: "America/Los_Angeles (PST)", value: "America/Los_Angeles" },
  { label: "America/Anchorage (AKST)", value: "America/Anchorage" },
  { label: "Pacific/Honolulu (HST)", value: "Pacific/Honolulu" },
  { label: "Europe/London (GMT)", value: "Europe/London" },
  { label: "Europe/Paris (CET)", value: "Europe/Paris" },
  { label: "Europe/Berlin (CET)", value: "Europe/Berlin" },
  { label: "Europe/Moscow (MSK)", value: "Europe/Moscow" },
  { label: "Asia/Dubai (GST)", value: "Asia/Dubai" },
  { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "Asia/Shanghai (CST)", value: "Asia/Shanghai" },
  { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Asia/Seoul (KST)", value: "Asia/Seoul" },
  { label: "Asia/Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Asia/Hong_Kong (HKT)", value: "Asia/Hong_Kong" },
  { label: "Australia/Sydney (AEDT)", value: "Australia/Sydney" },
  { label: "Australia/Melbourne (AEDT)", value: "Australia/Melbourne" },
  { label: "Pacific/Auckland (NZDT)", value: "Pacific/Auckland" },
]

export default function TimezonePage() {
  const now = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(now)
  const [hours, setHours] = useState<string>(String(now.getHours()).padStart(2, "0"))
  const [minutes, setMinutes] = useState<string>(String(now.getMinutes()).padStart(2, "0"))
  const [sourceTimezone, setSourceTimezone] = useState<string>("UTC")
  const [targetTimezones, setTargetTimezones] = useState<string[]>([
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
  ])
  const [availableTimezone, setAvailableTimezone] = useState<string>(
    "America/Los_Angeles"
  )

  const addTimezone = () => {
    if (availableTimezone && !targetTimezones.includes(availableTimezone)) {
      setTargetTimezones([...targetTimezones, availableTimezone])
    }
  }

  const removeTimezone = (tz: string) => {
    setTargetTimezones(targetTimezones.filter((t) => t !== tz))
  }

  const getInputDateTime = () => {
    const dateTime = new Date(selectedDate)
    dateTime.setHours(parseInt(hours) || 0)
    dateTime.setMinutes(parseInt(minutes) || 0)
    dateTime.setSeconds(0)
    return dateTime
  }

  const convertTime = (targetTz: string) => {
    try {
      const dateTime = getInputDateTime()

      // Format for the target timezone
      const options: Intl.DateTimeFormatOptions = {
        timeZone: targetTz,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }

      return new Intl.DateTimeFormat("en-US", options).format(dateTime)
    } catch (error) {
      return "Invalid time"
    }
  }

  const getTimezoneOffset = (tz: string) => {
    try {
      const date = new Date()
      const options: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        timeZoneName: "short",
      }
      const formatted = new Intl.DateTimeFormat("en-US", options).format(date)
      const parts = formatted.split(" ")
      return parts[parts.length - 1]
    } catch (error) {
      return ""
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="size-6" />
          Timezone Converter
        </h1>
        <p className="text-muted-foreground text-sm">
          Convert time across different timezones easily
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Time</CardTitle>
          <CardDescription>
            Enter a time and select the source timezone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Date & Time</label>
            <div className="flex gap-2 items-center flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1 min-w-[200px]",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate ? (
                      selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (val >= 0 && val <= 23) {
                    setHours(String(val).padStart(2, "0"))
                  }
                }}
                className="w-16 text-center"
                placeholder="HH"
              />
              <span className="text-muted-foreground">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (val >= 0 && val <= 59) {
                    setMinutes(String(val).padStart(2, "0"))
                  }
                }}
                className="w-16 text-center"
                placeholder="MM"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const now = new Date()
                  setHours(String(now.getHours()).padStart(2, "0"))
                  setMinutes(String(now.getMinutes()).padStart(2, "0"))
                }}
              >
                Now
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Source Timezone</label>
            <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Timezones</CardTitle>
          <CardDescription>Add timezones to convert to</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={availableTimezone}
              onValueChange={setAvailableTimezone}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select timezone to add" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIMEZONES.filter((tz) => !targetTimezones.includes(tz.value)).map(
                    (tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button onClick={addTimezone} variant="outline">
              <Plus className="size-4" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {targetTimezones.map((tz) => (
              <Badge key={tz} variant="outline" className="pr-1">
                {TIMEZONES.find((t) => t.value === tz)?.label || tz}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeTimezone(tz)}
                  className="ml-1 h-4 w-4"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Converted Times</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {targetTimezones.map((tz) => (
            <Card key={tz} size="sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{TIMEZONES.find((t) => t.value === tz)?.label || tz}</span>
                  <Badge variant="secondary">{getTimezoneOffset(tz)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base font-mono">{convertTime(tz)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {targetTimezones.length === 0 && (
          <Card size="sm">
            <CardContent className="text-center text-muted-foreground py-8">
              No target timezones selected. Add some above to see conversions.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
