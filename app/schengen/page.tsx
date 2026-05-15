"use client"

import { Suspense, useState, useEffect, useId } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plane, Plus, Trash2, Calendar as CalendarIcon, AlertTriangle, CircleCheck, Info, Share2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  differenceInCalendarDays,
  format,
  subDays,
  max as dateMax,
  min as dateMin,
  startOfDay,
  isBefore,
  isAfter,
  isValid,
} from "date-fns"

interface Trip {
  id: string
  entry: Date
  exit: Date
}

interface TripDateEditorProps {
  trip: Trip
  onChange: (id: string, entry: Date, exit: Date) => void
}

const STORAGE_KEY = "schengen-trips"
const TRIPS_QUERY_KEY = "trips"
const DATE_PARAM_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function sortTrips(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => a.entry.getTime() - b.entry.getTime())
}

function formatDateParam(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd")
}

function parseDateParam(value: string): Date | undefined {
  const match = DATE_PARAM_PATTERN.exec(value)
  if (!match) return undefined

  const [, year, month, day] = match
  const date = startOfDay(new Date(Number(year), Number(month) - 1, Number(day)))
  return isValid(date) && formatDateParam(date) === value ? date : undefined
}

function parseTripsParam(value: string): Trip[] {
  if (!value.trim()) return []

  const trips: Trip[] = []
  for (const [index, range] of value.split(",").entries()) {
    const [entryValue, exitValue, extra] = range.split("_")
    if (!entryValue || !exitValue || extra !== undefined) continue

    const entry = parseDateParam(entryValue)
    const exit = parseDateParam(exitValue)
    if (!entry || !exit || isAfter(entry, exit)) continue

    trips.push({
      id: `${entryValue}-${exitValue}-${index}`,
      entry,
      exit,
    })
  }

  return sortTrips(trips)
}

function serializeTripsParam(trips: Trip[]): string {
  return sortTrips(trips)
    .map((trip) => `${formatDateParam(trip.entry)}_${formatDateParam(trip.exit)}`)
    .join(",")
}

function parseStoredTrips(saved: string | null): Trip[] {
  if (!saved) return []

  try {
    const parsed: { id: string; entry: string; exit: string }[] = JSON.parse(saved)
    return sortTrips(
      parsed
        .map((trip) => {
          const entry = startOfDay(new Date(trip.entry))
          const exit = startOfDay(new Date(trip.exit))

          return {
            id: trip.id || generateId(),
            entry,
            exit,
          }
        })
        .filter((trip) => isValid(trip.entry) && isValid(trip.exit) && !isAfter(trip.entry, trip.exit))
    )
  } catch {
    return []
  }
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

function TripDateEditor({ trip, onChange }: TripDateEditorProps) {
  const [open, setOpen] = useState(false)
  const entryLabelId = useId()
  const exitLabelId = useId()
  const duration = differenceInCalendarDays(trip.exit, trip.entry) + 1
  const formattedEntry = format(trip.entry, "MMM d, yyyy")
  const formattedExit = format(trip.exit, "MMM d, yyyy")

  const updateEntry = (date?: Date) => {
    if (!date) return
    const nextEntry = startOfDay(date)
    const nextExit = isBefore(trip.exit, nextEntry) ? nextEntry : trip.exit
    onChange(trip.id, nextEntry, nextExit)
  }

  const updateExit = (date?: Date) => {
    if (!date) return
    onChange(trip.id, trip.entry, startOfDay(date))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 justify-start px-1.5 text-sm font-normal"
          aria-label={`Edit trip dates from ${formattedEntry} to ${formattedExit}`}
        >
          <CalendarIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">{formattedEntry}</span>
          <span className="text-muted-foreground" aria-hidden="true">→</span>
          <span className="font-medium">{formattedExit}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p id={entryLabelId} className="text-xs font-medium">Entry Date</p>
            <Calendar
              mode="single"
              selected={trip.entry}
              defaultMonth={trip.entry}
              onSelect={updateEntry}
              aria-labelledby={entryLabelId}
              initialFocus
            />
          </div>
          <div className="space-y-2">
            <p id={exitLabelId} className="text-xs font-medium">Exit Date</p>
            <Calendar
              mode="single"
              selected={trip.exit}
              defaultMonth={trip.exit}
              onSelect={updateExit}
              disabled={(date) => isBefore(date, trip.entry)}
              aria-labelledby={exitLabelId}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-xs text-muted-foreground">{duration} days</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function SchengenPage() {
  return (
    <Suspense fallback={null}>
      <SchengenCalculator />
    </Suspense>
  )
}

function SchengenCalculator() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [trips, setTrips] = useState<Trip[]>([])
  const [newEntry, setNewEntry] = useState<Date | undefined>(undefined)
  const [newExit, setNewExit] = useState<Date | undefined>(undefined)
  const [entryOpen, setEntryOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [today, setToday] = useState<Date>(new Date("2024-01-01"))
  const [isTripsHydrated, setIsTripsHydrated] = useState(false)
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared" | "error">("idle")

  useEffect(() => {
    if (isTripsHydrated) return

    setToday(startOfDay(new Date()))
    const tripsParam = searchParams.get(TRIPS_QUERY_KEY)
    const initialTrips = tripsParam === null
      ? parseStoredTrips(localStorage.getItem(STORAGE_KEY))
      : parseTripsParam(tripsParam)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrips(initialTrips)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTripsHydrated(true)
  }, [isTripsHydrated, searchParams])

  useEffect(() => {
    if (!isTripsHydrated) return

    if (trips.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips.map((t) => ({ id: t.id, entry: t.entry.toISOString(), exit: t.exit.toISOString() }))))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    const nextTripsParam = serializeTripsParam(trips)
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    if (nextTripsParam) {
      nextSearchParams.set(TRIPS_QUERY_KEY, nextTripsParam)
    } else {
      nextSearchParams.delete(TRIPS_QUERY_KEY)
    }

    const nextQuery = nextSearchParams.toString()
    const currentQuery = window.location.search.slice(1)
    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`, {
        scroll: false,
      })
    }
  }, [isTripsHydrated, pathname, router, searchParams, trips])

  const addTrip = () => {
    if (!newEntry || !newExit || isAfter(newEntry, newExit)) return
    setTrips((prev) =>
      sortTrips([...prev, { id: generateId(), entry: startOfDay(newEntry), exit: startOfDay(newExit) }])
    )
    setNewEntry(undefined)
    setNewExit(undefined)
  }

  const selectNewEntry = (date?: Date) => {
    if (!date) return
    const nextEntry = startOfDay(date)
    setNewEntry(nextEntry)
    if (newExit && isBefore(newExit, nextEntry)) {
      setNewExit(nextEntry)
    }
    setEntryOpen(false)
  }

  const selectNewExit = (date?: Date) => {
    if (!date) return
    setNewExit(startOfDay(date))
    setExitOpen(false)
  }

  const updateTripDates = (id: string, entry: Date, exit: Date) => {
    const nextEntry = startOfDay(entry)
    const nextExit = startOfDay(exit)
    if (isAfter(nextEntry, nextExit)) return

    setTrips((prev) =>
      sortTrips(prev.map((trip) => (trip.id === id ? { ...trip, entry: nextEntry, exit: nextExit } : trip)))
    )
  }

  const removeTrip = (id: string) => setTrips((prev) => prev.filter((t) => t.id !== id))

  const buildShareUrl = () => {
    const shareUrl = new URL(window.location.href)
    const tripsParam = serializeTripsParam(trips)

    if (tripsParam) {
      shareUrl.searchParams.set(TRIPS_QUERY_KEY, tripsParam)
    } else {
      shareUrl.searchParams.delete(TRIPS_QUERY_KEY)
    }

    return shareUrl.toString()
  }

  const shareCalculator = async () => {
    const shareUrl = buildShareUrl()

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Schengen Visa Calculator",
          url: shareUrl,
        })
        setShareStatus("shared")
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setShareStatus("copied")
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus("idle")
        return
      }

      try {
        await navigator.clipboard.writeText(shareUrl)
        setShareStatus("copied")
      } catch {
        setShareStatus("error")
      }
    }
  }

  useEffect(() => {
    if (shareStatus === "idle") return

    const timeout = window.setTimeout(() => {
      setShareStatus("idle")
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [shareStatus])

  // Use the peak date (worst-case across all trips including future) for the main calculation
  const peakDate = trips.length > 0 ? findPeakDate(trips, today) : today
  const daysUsed = countDaysUsed(trips, peakDate)
  const daysRemaining = Math.max(0, 90 - daysUsed)
  const isOverstay = daysUsed > 90
  const pct = Math.min(100, Math.round((daysUsed / 90) * 100))

  return (
    <div className="container mx-auto max-w-4xl px-6 py-14 space-y-8" data-stagger>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-up">
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Plane className="size-8 text-primary" />
            Schengen Visa Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            90/180 rule — you may stay up to 90 days in any 180-day rolling window
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Button
            type="button"
            variant="outline"
            onClick={shareCalculator}
            className="shrink-0"
            aria-label="Share calculator link"
          >
            {shareStatus === "copied" || shareStatus === "shared" ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Share2 className="size-4" aria-hidden="true" />
            )}
            {shareStatus === "copied" ? "Copied" : shareStatus === "shared" ? "Shared" : "Share"}
          </Button>
          <p className="min-h-4 text-xs text-muted-foreground" aria-live="polite">
            {shareStatus === "copied"
              ? "Link copied to clipboard"
              : shareStatus === "shared"
                ? "Share sheet opened"
                : shareStatus === "error"
                  ? "Could not share link"
                  : ""}
          </p>
        </div>
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
                  <Calendar
                    mode="single"
                    selected={newEntry}
                    defaultMonth={newEntry}
                    onSelect={selectNewEntry}
                    initialFocus
                  />
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
                  <Calendar
                    mode="single"
                    selected={newExit}
                    defaultMonth={newExit ?? newEntry}
                    onSelect={selectNewExit}
                    disabled={newEntry ? (d) => isBefore(d, newEntry) : undefined}
                    initialFocus
                  />
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
                      <TripDateEditor trip={trip} onChange={updateTripDates} />
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
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeTrip(trip.id)}
                      aria-label={`Remove trip from ${format(trip.entry, "MMM d, yyyy")} to ${format(trip.exit, "MMM d, yyyy")}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
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
