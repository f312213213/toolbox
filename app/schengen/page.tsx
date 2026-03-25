"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plane, Plus, Trash2, Calendar as CalendarIcon, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  differenceInCalendarDays,
  format,
  subDays,
  isWithinInterval,
  max as dateMax,
  min as dateMin,
  addDays,
  startOfDay,
  isBefore,
  isAfter,
} from "date-fns"

interface Trip {
  id: string
  entry: Date
  exit: Date
}

const STORAGE_KEY = "schengen-trips"

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

/** Count how many days from the given trips fall within the 180-day window ending on `refDate` (inclusive). */
function countDaysUsed(trips: Trip[], refDate: Date): number {
  const windowStart = startOfDay(subDays(refDate, 179)) // 180-day window: windowStart .. refDate
  const windowEnd = startOfDay(refDate)

  let total = 0
  for (const trip of trips) {
    const tripStart = startOfDay(trip.entry)
    const tripEnd = startOfDay(trip.exit)

    // Overlap between [tripStart, tripEnd] and [windowStart, windowEnd]
    const overlapStart = dateMax([tripStart, windowStart])
    const overlapEnd = dateMin([tripEnd, windowEnd])

    if (!isAfter(overlapStart, overlapEnd)) {
      total += differenceInCalendarDays(overlapEnd, overlapStart) + 1
    }
  }
  return total
}

/** Find the earliest future date when the user can re-enter and have `wantDays` available. */
function findNextEntryDate(trips: Trip[], today: Date, wantDays: number): Date | null {
  // Scan forward up to 180 days
  for (let offset = 0; offset <= 180; offset++) {
    const candidate = addDays(today, offset)
    const used = countDaysUsed(trips, candidate)
    if (90 - used >= wantDays) return candidate
  }
  return null
}

/** Find the peak (worst-case) usage across all trip exit dates including future trips. */
function findPeakUsage(trips: Trip[], today: Date): { date: Date; used: number } {
  let peakDate = today
  let peakUsed = countDaysUsed(trips, today)

  for (const trip of trips) {
    const exitDate = startOfDay(trip.exit)
    // Check at each trip's exit date
    const used = countDaysUsed(trips, exitDate)
    if (used > peakUsed) {
      peakUsed = used
      peakDate = exitDate
    }
  }

  return { date: peakDate, used: peakUsed }
}

export default function SchengenPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [newEntry, setNewEntry] = useState<Date | undefined>(undefined)
  const [newExit, setNewExit] = useState<Date | undefined>(undefined)
  const [entryOpen, setEntryOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [today, setToday] = useState<Date>(new Date("2024-01-01"))

  // Hydration-safe init
  useEffect(() => {
    setToday(startOfDay(new Date()))

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed: { id: string; entry: string; exit: string }[] = JSON.parse(saved)
        setTrips(
          parsed.map((t) => ({
            id: t.id,
            entry: new Date(t.entry),
            exit: new Date(t.exit),
          }))
        )
      } catch {
        // ignore
      }
    }
  }, [])

  // Persist
  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(trips.map((t) => ({ id: t.id, entry: t.entry.toISOString(), exit: t.exit.toISOString() })))
      )
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [trips])

  const addTrip = () => {
    if (!newEntry || !newExit) return
    if (isAfter(newEntry, newExit)) return

    setTrips((prev) =>
      [...prev, { id: generateId(), entry: startOfDay(newEntry), exit: startOfDay(newExit) }].sort(
        (a, b) => a.entry.getTime() - b.entry.getTime()
      )
    )
    setNewEntry(undefined)
    setNewExit(undefined)
  }

  const removeTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  const daysUsed = countDaysUsed(trips, today)
  const daysRemaining = Math.max(0, 90 - daysUsed)
  const isOverstay = daysUsed > 90
  const nextFullEntry = daysRemaining === 0 ? findNextEntryDate(trips, addDays(today, 1), 1) : null

  // Peak usage across all trips (including future planned ones)
  const peak = findPeakUsage(trips, today)
  const hasFutureTrips = trips.some((t) => isAfter(startOfDay(t.exit), today))
  const showProjected = hasFutureTrips && peak.used > daysUsed
  const projectedRemaining = Math.max(0, 90 - peak.used)
  const isProjectedOverstay = peak.used > 90

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plane className="size-6" />
          Schengen Visa Calculator
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your stays under the Schengen 90/180 visa-free rule
        </p>
      </div>

      {/* Status Card */}
      <Card className={cn(isOverstay ? "border-destructive" : daysRemaining <= 14 ? "border-yellow-500" : "")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOverstay ? (
              <AlertTriangle className="size-5 text-destructive" />
            ) : (
              <CheckCircle className={cn("size-5", daysRemaining <= 14 ? "text-yellow-500" : "text-green-500")} />
            )}
            Status as of {format(today, "MMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Days Used (180-day window)</p>
              <p className="text-2xl font-bold">{daysUsed}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Days Remaining</p>
              <p className={cn("text-2xl font-bold", isOverstay ? "text-destructive" : daysRemaining <= 14 ? "text-yellow-500" : "text-green-500")}>
                {isOverstay ? `−${daysUsed - 90}` : daysRemaining}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">180-day Window</p>
              <p className="text-sm">
                {format(subDays(today, 179), "MMM d, yyyy")} — {format(today, "MMM d, yyyy")}
              </p>
            </div>
          </div>
          {isOverstay && (
            <div className="mt-4 text-sm text-destructive">
              You have exceeded the 90-day limit.
            </div>
          )}
          {!isOverstay && daysRemaining === 0 && nextFullEntry && (
            <div className="mt-4 text-sm text-muted-foreground">
              Next available entry date: <span className="font-medium text-foreground">{format(nextFullEntry, "MMM d, yyyy")}</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{daysUsed} / 90 days</span>
              <span>{Math.min(100, Math.round((daysUsed / 90) * 100))}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isOverstay ? "bg-destructive" : daysUsed / 90 > 0.75 ? "bg-yellow-500" : "bg-green-500"
                )}
                style={{ width: `${Math.min(100, (daysUsed / 90) * 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projected Status (if future trips exist) */}
      {showProjected && (
        <Card className={cn(isProjectedOverstay ? "border-destructive" : projectedRemaining <= 14 ? "border-yellow-500" : "")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isProjectedOverstay ? (
                <AlertTriangle className="size-5 text-destructive" />
              ) : (
                <CheckCircle className={cn("size-5", projectedRemaining <= 14 ? "text-yellow-500" : "text-green-500")} />
              )}
              Projected Peak — {format(peak.date, "MMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              Worst-case usage including planned future trips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Days Used (180-day window)</p>
                <p className="text-2xl font-bold">{peak.used}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Days Remaining</p>
                <p className={cn("text-2xl font-bold", isProjectedOverstay ? "text-destructive" : projectedRemaining <= 14 ? "text-yellow-500" : "text-green-500")}>
                  {isProjectedOverstay ? `−${peak.used - 90}` : projectedRemaining}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">180-day Window</p>
                <p className="text-sm">
                  {format(subDays(peak.date, 179), "MMM d, yyyy")} — {format(peak.date, "MMM d, yyyy")}
                </p>
              </div>
            </div>
            {isProjectedOverstay && (
              <div className="mt-4 text-sm text-destructive">
                Your planned trips will exceed the 90-day limit!
              </div>
            )}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{peak.used} / 90 days</span>
                <span>{Math.min(100, Math.round((peak.used / 90) * 100))}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isProjectedOverstay ? "bg-destructive" : peak.used / 90 > 0.75 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{ width: `${Math.min(100, (peak.used / 90) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Trip */}
      <Card>
        <CardHeader>
          <CardTitle>Add Trip</CardTitle>
          <CardDescription>
            Enter entry and exit dates (both dates count as days in the Schengen Area)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-medium">Entry Date</label>
              <Popover open={entryOpen} onOpenChange={setEntryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal w-full", !newEntry && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-1.5 size-4 shrink-0" />
                    {newEntry ? format(newEntry, "MMM d, yyyy") : "Pick entry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEntry}
                    onSelect={(date) => {
                      if (date) setNewEntry(date)
                      setEntryOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-medium">Exit Date</label>
              <Popover open={exitOpen} onOpenChange={setExitOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal w-full", !newExit && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-1.5 size-4 shrink-0" />
                    {newExit ? format(newExit, "MMM d, yyyy") : "Pick exit date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newExit}
                    onSelect={(date) => {
                      if (date) setNewExit(date)
                      setExitOpen(false)
                    }}
                    disabled={newEntry ? (d) => isBefore(d, newEntry) : undefined}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={addTrip}
              disabled={!newEntry || !newExit || isAfter(newEntry, newExit)}
              className="shrink-0"
            >
              <Plus className="size-4 mr-1" />
              Add
            </Button>
          </div>
          {newEntry && newExit && !isAfter(newEntry, newExit) && (
            <p className="text-xs text-muted-foreground">
              Trip duration: {differenceInCalendarDays(newExit, newEntry) + 1} days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trip List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Travel History</h2>
        {trips.length === 0 ? (
          <Card size="sm">
            <CardContent className="text-center text-muted-foreground py-8">
              No trips added yet. Add your Schengen area travel dates above.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {trips.map((trip) => {
              const duration = differenceInCalendarDays(trip.exit, trip.entry) + 1
              const inWindow = isWithinInterval(trip.exit, {
                start: subDays(today, 179),
                end: today,
              }) || isWithinInterval(trip.entry, {
                start: subDays(today, 179),
                end: today,
              })

              return (
                <Card key={trip.id} size="sm">
                  <CardContent className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{format(trip.entry, "MMM d, yyyy")}</span>
                        <span className="text-muted-foreground mx-1.5">→</span>
                        <span className="font-medium">{format(trip.exit, "MMM d, yyyy")}</span>
                      </div>
                      <Badge variant={inWindow ? "default" : "outline"} className="shrink-0">
                        {duration}d
                      </Badge>
                      {inWindow && (
                        <Badge variant="secondary" className="shrink-0">
                          in window
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => removeTrip(trip.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">About the 90/180 Rule</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Visa-free travellers to the Schengen Area may stay for a maximum of <strong className="text-foreground">90 days within any 180-day period</strong>.
          </p>
          <p>
            The 180-day window is a rolling window — for any given day, it looks back 180 days and counts how many of those days you were present in the Schengen Area. Both the entry and exit days are counted as full days.
          </p>
        </CardContent>
      </Card>

      <Link href="/">
        <Button variant="outline" className="fixed bottom-6 right-6">
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
