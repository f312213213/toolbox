"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plane, Plus, Trash2, Calendar as CalendarIcon, AlertTriangle, CircleCheck, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  differenceInCalendarDays,
  format,
  subDays,
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

/** Count days from trips within the 180-day window ending on refDate. */
function countDaysUsed(trips: Trip[], refDate: Date): number {
  const windowStart = startOfDay(subDays(refDate, 179))
  const windowEnd = startOfDay(refDate)
  let total = 0
  for (const trip of trips) {
    const overlapStart = dateMax([startOfDay(trip.entry), windowStart])
    const overlapEnd = dateMin([startOfDay(trip.exit), windowEnd])
    if (!isAfter(overlapStart, overlapEnd)) {
      total += differenceInCalendarDays(overlapEnd, overlapStart) + 1
    }
  }
  return total
}

/** Find the date with the highest usage across all trip exit dates. */
function findPeakDate(trips: Trip[], today: Date): Date {
  let peakDate = today
  let peakUsed = countDaysUsed(trips, today)
  for (const trip of trips) {
    const d = startOfDay(trip.exit)
    const used = countDaysUsed(trips, d)
    if (used > peakUsed) {
      peakUsed = used
      peakDate = d
    }
  }
  return peakDate
}

/** How many days of this trip overlap with the 180-day window ending on refDate. */
function tripDaysInWindow(trip: Trip, refDate: Date): number {
  const windowStart = startOfDay(subDays(refDate, 179))
  const windowEnd = startOfDay(refDate)
  const overlapStart = dateMax([startOfDay(trip.entry), windowStart])
  const overlapEnd = dateMin([startOfDay(trip.exit), windowEnd])
  if (isAfter(overlapStart, overlapEnd)) return 0
  return differenceInCalendarDays(overlapEnd, overlapStart) + 1
}

export default function SchengenPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [newEntry, setNewEntry] = useState<Date | undefined>(undefined)
  const [newExit, setNewExit] = useState<Date | undefined>(undefined)
  const [entryOpen, setEntryOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [today, setToday] = useState<Date>(new Date("2024-01-01"))

  useEffect(() => {
    setToday(startOfDay(new Date()))
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed: { id: string; entry: string; exit: string }[] = JSON.parse(saved)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTrips(
          parsed.map((t) => ({ id: t.id, entry: new Date(t.entry), exit: new Date(t.exit) }))
        )
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips.map((t) => ({ id: t.id, entry: t.entry.toISOString(), exit: t.exit.toISOString() }))))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [trips])

  const addTrip = () => {
    if (!newEntry || !newExit || isAfter(newEntry, newExit)) return
    setTrips((prev) =>
      [...prev, { id: generateId(), entry: startOfDay(newEntry), exit: startOfDay(newExit) }].sort(
        (a, b) => a.entry.getTime() - b.entry.getTime()
      )
    )
    setNewEntry(undefined)
    setNewExit(undefined)
  }

  const removeTrip = (id: string) => setTrips((prev) => prev.filter((t) => t.id !== id))

  // Use the peak date (worst-case across all trips including future) for the main calculation
  const peakDate = trips.length > 0 ? findPeakDate(trips, today) : today
  const daysUsed = countDaysUsed(trips, peakDate)
  const daysRemaining = Math.max(0, 90 - daysUsed)
  const isOverstay = daysUsed > 90
  const pct = Math.min(100, Math.round((daysUsed / 90) * 100))

  return (
    <div className="container mx-auto max-w-4xl px-6 py-14 space-y-8" data-stagger>
      <div className="space-y-3 animate-fade-up">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Plane className="size-8 text-primary" />
          Schengen Visa Calculator
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          90/180 rule — you may stay up to 90 days in any 180-day rolling window
        </p>
      </div>

      {/* Main Result */}
      <Card className={cn(
        "border-2",
        isOverstay ? "border-destructive" : daysRemaining <= 14 ? "border-yellow-500" : "border-green-500/50"
      )}>
        <CardContent className="pt-6 pb-6">
          {/* Big number */}
          <div className="text-center space-y-3">
            {trips.length === 0 ? (
              <>
                <p className="text-7xl font-black tracking-tight">90</p>
                <p className="text-muted-foreground text-base">days available — add your trips below</p>
              </>
            ) : isOverstay ? (
              <>
                <div className="flex items-center justify-center gap-4">
                  <AlertTriangle className="size-10 text-destructive" />
                  <p className="text-5xl font-black tracking-tight text-destructive">Over by {daysUsed - 90}</p>
                </div>
                <p className="text-muted-foreground text-base">You exceed the 90-day limit</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4">
                  <CircleCheck className={cn("size-10", daysRemaining <= 14 ? "text-yellow-500" : "text-green-500")} />
                  <p className={cn("text-5xl font-black tracking-tight", daysRemaining <= 14 ? "text-yellow-500" : "text-green-500")}>
                    {daysRemaining} days left
                  </p>
                </div>
                <p className="text-muted-foreground text-base">
                  {daysUsed} of 90 days used
                </p>
              </>
            )}
          </div>

          {/* Progress bar */}
          {trips.length > 0 && (
            <div className="mt-8 space-y-2">
              <div className="h-4 bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out animate-fill",
                    isOverstay ? "bg-destructive" : pct > 75 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center tracking-wide uppercase">
                {daysUsed} / 90 days ({pct}%) — as of {format(peakDate, "MMM d, yyyy")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Trip */}
      <Card>
        <CardHeader>
          <CardTitle>Add Trip</CardTitle>
          <CardDescription>
            Both entry and exit days count as days spent in the Schengen Area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-medium">Entry Date</label>
              <Popover open={entryOpen} onOpenChange={setEntryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal w-full", !newEntry && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1.5 size-4 shrink-0" />
                    {newEntry ? format(newEntry, "MMM d, yyyy") : "Pick entry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={newEntry} onSelect={(date) => { if (date) setNewEntry(date); setEntryOpen(false) }} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-medium">Exit Date</label>
              <Popover open={exitOpen} onOpenChange={setExitOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal w-full", !newExit && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1.5 size-4 shrink-0" />
                    {newExit ? format(newExit, "MMM d, yyyy") : "Pick exit date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={newExit} onSelect={(date) => { if (date) setNewExit(date); setExitOpen(false) }} disabled={newEntry ? (d) => isBefore(d, newEntry) : undefined} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={addTrip} disabled={!newEntry || !newExit || isAfter(newEntry, newExit)} className="shrink-0">
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
      {trips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Trips</h2>
          <div className="grid gap-2">
            {trips.map((trip) => {
              const duration = differenceInCalendarDays(trip.exit, trip.entry) + 1
              const counted = tripDaysInWindow(trip, peakDate)
              const isFuture = isAfter(startOfDay(trip.entry), today)
              const isExpired = counted === 0

              return (
                <Card key={trip.id} size="sm">
                  <CardContent className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <div className="text-sm whitespace-nowrap">
                        <span className="font-medium">{format(trip.entry, "MMM d, yyyy")}</span>
                        <span className="text-muted-foreground mx-1.5">→</span>
                        <span className="font-medium">{format(trip.exit, "MMM d, yyyy")}</span>
                      </div>
                      <Badge variant={isExpired ? "outline" : "default"} className="shrink-0">
                        {counted > 0 ? `${counted}d counted` : `${duration}d`}
                      </Badge>
                      {isFuture && (
                        <Badge variant="secondary" className="shrink-0">planned</Badge>
                      )}
                      {isExpired && (
                        <Badge variant="outline" className="shrink-0 text-muted-foreground">expired</Badge>
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
        </div>
      )}

      {/* How it works */}
      <Card>
        <CardContent className="flex gap-3 py-4">
          <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            We check the <strong className="text-foreground">worst-case date</strong> across all your trips and count how many days fall in its 180-day window. If you're over 90, you've overstayed.
          </p>
        </CardContent>
      </Card>

      <Link href="/" className="animate-fade-in stagger-3">
        <Button variant="outline" className="fixed bottom-6 right-6 font-semibold">
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
