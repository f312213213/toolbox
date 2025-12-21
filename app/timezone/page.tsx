"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock, Plus, X, Calendar as CalendarIcon, Home } from "lucide-react"
import { cn } from "@/lib/utils"

// Timezones organized by region with major cities
const TIMEZONES = [
  { id: "utc", label: "UTC", value: "UTC" },
  { id: "local", label: "Local Time", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: "common-est", label: "EST (Eastern)", value: "America/New_York" },
  { id: "common-cst", label: "CST (Central)", value: "America/Chicago" },
  { id: "common-mst", label: "MST (Mountain)", value: "America/Denver" },
  { id: "common-pst", label: "PST (Pacific)", value: "America/Los_Angeles" },
  { id: "common-gmt", label: "GMT (London)", value: "Europe/London" },
  { id: "common-cet", label: "CET (Central Europe)", value: "Europe/Paris" },
  { id: "common-ist", label: "IST (India)", value: "Asia/Kolkata" },
  { id: "common-jst", label: "JST (Japan)", value: "Asia/Tokyo" },
  { id: "common-aest", label: "AEST (Australia)", value: "Australia/Sydney" },

  // North America - United States
  { id: "us-ny", label: "New York", value: "America/New_York" },
  { id: "us-chi", label: "Chicago", value: "America/Chicago" },
  { id: "us-den", label: "Denver", value: "America/Denver" },
  { id: "us-la", label: "Los Angeles", value: "America/Los_Angeles" },
  { id: "us-phx", label: "Phoenix", value: "America/Phoenix" },
  { id: "us-anc", label: "Anchorage", value: "America/Anchorage" },
  { id: "us-hnl", label: "Honolulu", value: "Pacific/Honolulu" },
  { id: "us-bos", label: "Boston", value: "America/New_York" },
  { id: "us-mia", label: "Miami", value: "America/New_York" },
  { id: "us-sea", label: "Seattle", value: "America/Los_Angeles" },
  { id: "us-sf", label: "San Francisco", value: "America/Los_Angeles" },
  { id: "us-lv", label: "Las Vegas", value: "America/Los_Angeles" },
  { id: "us-dal", label: "Dallas", value: "America/Chicago" },
  { id: "us-hou", label: "Houston", value: "America/Chicago" },
  { id: "us-atl", label: "Atlanta", value: "America/New_York" },
  { id: "us-phi", label: "Philadelphia", value: "America/New_York" },
  { id: "us-det", label: "Detroit", value: "America/Detroit" },

  // North America - Canada
  { id: "ca-tor", label: "Toronto", value: "America/Toronto" },
  { id: "ca-van", label: "Vancouver", value: "America/Vancouver" },
  { id: "ca-mtl", label: "Montreal", value: "America/Montreal" },
  { id: "ca-cal", label: "Calgary", value: "America/Edmonton" },
  { id: "ca-ott", label: "Ottawa", value: "America/Toronto" },

  // North America - Mexico
  { id: "mx-mex", label: "Mexico City", value: "America/Mexico_City" },
  { id: "mx-cun", label: "Cancun", value: "America/Cancun" },
  { id: "mx-tij", label: "Tijuana", value: "America/Tijuana" },

  // Central & South America
  { id: "ar-bue", label: "Buenos Aires", value: "America/Argentina/Buenos_Aires" },
  { id: "br-sao", label: "São Paulo", value: "America/Sao_Paulo" },
  { id: "br-rio", label: "Rio de Janeiro", value: "America/Sao_Paulo" },
  { id: "pe-lim", label: "Lima", value: "America/Lima" },
  { id: "co-bog", label: "Bogotá", value: "America/Bogota" },
  { id: "cl-scl", label: "Santiago", value: "America/Santiago" },
  { id: "ve-ccs", label: "Caracas", value: "America/Caracas" },
  { id: "pa-pty", label: "Panama City", value: "America/Panama" },
  { id: "uy-mvd", label: "Montevideo", value: "America/Montevideo" },

  // Europe - Western
  { id: "gb-lon", label: "London", value: "Europe/London" },
  { id: "ie-dub", label: "Dublin", value: "Europe/Dublin" },
  { id: "pt-lis", label: "Lisbon", value: "Europe/Lisbon" },
  { id: "is-rek", label: "Reykjavik", value: "Atlantic/Reykjavik" },

  // Europe - Central
  { id: "fr-par", label: "Paris", value: "Europe/Paris" },
  { id: "de-ber", label: "Berlin", value: "Europe/Berlin" },
  { id: "nl-ams", label: "Amsterdam", value: "Europe/Amsterdam" },
  { id: "be-bru", label: "Brussels", value: "Europe/Brussels" },
  { id: "es-mad", label: "Madrid", value: "Europe/Madrid" },
  { id: "it-rom", label: "Rome", value: "Europe/Rome" },
  { id: "at-vie", label: "Vienna", value: "Europe/Vienna" },
  { id: "ch-zur", label: "Zurich", value: "Europe/Zurich" },
  { id: "cz-prg", label: "Prague", value: "Europe/Prague" },
  { id: "pl-war", label: "Warsaw", value: "Europe/Warsaw" },
  { id: "se-sto", label: "Stockholm", value: "Europe/Stockholm" },
  { id: "dk-cop", label: "Copenhagen", value: "Europe/Copenhagen" },
  { id: "no-osl", label: "Oslo", value: "Europe/Oslo" },
  { id: "hu-bud", label: "Budapest", value: "Europe/Budapest" },

  // Europe - Eastern
  { id: "gr-ath", label: "Athens", value: "Europe/Athens" },
  { id: "tr-ist", label: "Istanbul", value: "Europe/Istanbul" },
  { id: "fi-hel", label: "Helsinki", value: "Europe/Helsinki" },
  { id: "ro-buc", label: "Bucharest", value: "Europe/Bucharest" },
  { id: "ua-kiv", label: "Kiev", value: "Europe/Kiev" },
  { id: "ru-mos", label: "Moscow", value: "Europe/Moscow" },
  { id: "ru-stp", label: "St. Petersburg", value: "Europe/Moscow" },

  // Middle East
  { id: "ae-dxb", label: "Dubai", value: "Asia/Dubai" },
  { id: "ae-auh", label: "Abu Dhabi", value: "Asia/Dubai" },
  { id: "sa-ruh", label: "Riyadh", value: "Asia/Riyadh" },
  { id: "il-tlv", label: "Tel Aviv", value: "Asia/Tel_Aviv" },
  { id: "il-jer", label: "Jerusalem", value: "Asia/Jerusalem" },
  { id: "lb-bey", label: "Beirut", value: "Asia/Beirut" },
  { id: "kw-kwi", label: "Kuwait City", value: "Asia/Kuwait" },
  { id: "qa-doh", label: "Doha", value: "Asia/Qatar" },
  { id: "om-mct", label: "Muscat", value: "Asia/Muscat" },
  { id: "iq-bgw", label: "Baghdad", value: "Asia/Baghdad" },
  { id: "ir-thr", label: "Tehran", value: "Asia/Tehran" },

  // Africa
  { id: "eg-cai", label: "Cairo", value: "Africa/Cairo" },
  { id: "ng-los", label: "Lagos", value: "Africa/Lagos" },
  { id: "ke-nbo", label: "Nairobi", value: "Africa/Nairobi" },
  { id: "za-jnb", label: "Johannesburg", value: "Africa/Johannesburg" },
  { id: "za-cpt", label: "Cape Town", value: "Africa/Johannesburg" },
  { id: "ma-cas", label: "Casablanca", value: "Africa/Casablanca" },
  { id: "dz-alg", label: "Algiers", value: "Africa/Algiers" },
  { id: "tn-tun", label: "Tunis", value: "Africa/Tunis" },
  { id: "et-add", label: "Addis Ababa", value: "Africa/Addis_Ababa" },
  { id: "tz-dar", label: "Dar es Salaam", value: "Africa/Dar_es_Salaam" },

  // Asia - South
  { id: "in-bom", label: "Mumbai", value: "Asia/Kolkata" },
  { id: "in-del", label: "Delhi", value: "Asia/Kolkata" },
  { id: "in-blr", label: "Bangalore", value: "Asia/Kolkata" },
  { id: "in-ccu", label: "Kolkata", value: "Asia/Kolkata" },
  { id: "pk-khi", label: "Karachi", value: "Asia/Karachi" },
  { id: "bd-dac", label: "Dhaka", value: "Asia/Dhaka" },
  { id: "lk-cmb", label: "Colombo", value: "Asia/Colombo" },

  // Asia - Southeast
  { id: "th-bkk", label: "Bangkok", value: "Asia/Bangkok" },
  { id: "sg-sin", label: "Singapore", value: "Asia/Singapore" },
  { id: "my-kul", label: "Kuala Lumpur", value: "Asia/Kuala_Lumpur" },
  { id: "id-jkt", label: "Jakarta", value: "Asia/Jakarta" },
  { id: "ph-mnl", label: "Manila", value: "Asia/Manila" },
  { id: "vn-sgn", label: "Ho Chi Minh City", value: "Asia/Ho_Chi_Minh" },
  { id: "vn-han", label: "Hanoi", value: "Asia/Bangkok" },
  { id: "mm-rgn", label: "Yangon", value: "Asia/Yangon" },

  // Asia - East
  { id: "hk-hkg", label: "Hong Kong", value: "Asia/Hong_Kong" },
  { id: "cn-sha", label: "Shanghai", value: "Asia/Shanghai" },
  { id: "cn-bjs", label: "Beijing", value: "Asia/Shanghai" },
  { id: "tw-tpe", label: "Taipei", value: "Asia/Taipei" },
  { id: "jp-tyo", label: "Tokyo", value: "Asia/Tokyo" },
  { id: "kr-sel", label: "Seoul", value: "Asia/Seoul" },
  { id: "jp-osa", label: "Osaka", value: "Asia/Tokyo" },

  // Asia - Central
  { id: "kz-ala", label: "Almaty", value: "Asia/Almaty" },
  { id: "uz-tas", label: "Tashkent", value: "Asia/Tashkent" },
  { id: "ge-tbs", label: "Tbilisi", value: "Asia/Tbilisi" },
  { id: "am-evn", label: "Yerevan", value: "Asia/Yerevan" },

  // Oceania
  { id: "au-syd", label: "Sydney", value: "Australia/Sydney" },
  { id: "au-mel", label: "Melbourne", value: "Australia/Melbourne" },
  { id: "au-bne", label: "Brisbane", value: "Australia/Brisbane" },
  { id: "au-per", label: "Perth", value: "Australia/Perth" },
  { id: "au-adl", label: "Adelaide", value: "Australia/Adelaide" },
  { id: "nz-akl", label: "Auckland", value: "Pacific/Auckland" },
  { id: "nz-wel", label: "Wellington", value: "Pacific/Auckland" },
  { id: "fj-suv", label: "Fiji", value: "Pacific/Fiji" },
  { id: "gu-gum", label: "Guam", value: "Pacific/Guam" },
  { id: "pg-pom", label: "Port Moresby", value: "Pacific/Port_Moresby" },
]

// Organized timezone groups for dropdown display
const TIMEZONE_GROUPS = [
  {
    label: "Common",
    timezones: TIMEZONES.slice(0, 11), // UTC, Local Time, and major timezone abbreviations
  },
  {
    label: "North America - United States",
    timezones: TIMEZONES.slice(11, 28),
  },
  {
    label: "North America - Canada",
    timezones: TIMEZONES.slice(28, 33),
  },
  {
    label: "North America - Mexico",
    timezones: TIMEZONES.slice(33, 36),
  },
  {
    label: "Central & South America",
    timezones: TIMEZONES.slice(36, 45),
  },
  {
    label: "Europe - Western",
    timezones: TIMEZONES.slice(45, 49),
  },
  {
    label: "Europe - Central",
    timezones: TIMEZONES.slice(49, 63),
  },
  {
    label: "Europe - Eastern",
    timezones: TIMEZONES.slice(63, 70),
  },
  {
    label: "Middle East",
    timezones: TIMEZONES.slice(70, 81),
  },
  {
    label: "Africa",
    timezones: TIMEZONES.slice(81, 91),
  },
  {
    label: "Asia - South",
    timezones: TIMEZONES.slice(91, 98),
  },
  {
    label: "Asia - Southeast",
    timezones: TIMEZONES.slice(98, 106),
  },
  {
    label: "Asia - East",
    timezones: TIMEZONES.slice(106, 113),
  },
  {
    label: "Asia - Central",
    timezones: TIMEZONES.slice(113, 117),
  },
  {
    label: "Oceania",
    timezones: TIMEZONES.slice(117, 127),
  },
]

export default function TimezonePage() {
  // Use fixed initial values to avoid hydration mismatch
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2024-01-01"))
  const [hours, setHours] = useState<string>("12")
  const [minutes, setMinutes] = useState<string>("00")
  const [sourceTimezone, setSourceTimezone] = useState<string>("local")
  const [targetTimezones, setTargetTimezones] = useState<string[]>([])
  const [availableTimezone, setAvailableTimezone] = useState<string>("utc")

  // Initialize with current time and load saved timezones after mount
  useEffect(() => {
    const now = new Date()
  // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedDate(now)
    setHours(String(now.getHours()).padStart(2, "0"))
    setMinutes(String(now.getMinutes()).padStart(2, "0"))

    // Load saved timezones from localStorage
    const saved = localStorage.getItem("targetTimezones")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setTargetTimezones(parsed)
        }
      } catch (error) {
        console.error("Failed to parse saved timezones:", error)
      }
    }
  }, [])

  // Save target timezones to localStorage whenever they change
  useEffect(() => {
    if (targetTimezones.length > 0 || localStorage.getItem("targetTimezones")) {
      localStorage.setItem("targetTimezones", JSON.stringify(targetTimezones))
    } 
  }, [targetTimezones])

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

  const convertTime = (tzId: string) => {
    try {
      const timezone = getTimezoneById(tzId)
      if (!timezone) return "Invalid timezone"

      const dateTime = getInputDateTime()

      // Format for the target timezone
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone.value,
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
        timeZoneName: "shortOffset",
      }
      const formatted = new Intl.DateTimeFormat("en-US", options).format(date)
      const parts = formatted.split(" ")
      return parts[parts.length - 1]
    } catch (error) {
      return ""
    }
  }

  const formatTimezoneLabel = (tz: { id: string; label: string; value: string }) => {
    const offset = getTimezoneOffset(tz.value)
    return `${tz.label} (${offset})`
  }

  const getTimezoneById = (id: string) => {
    return TIMEZONES.find((tz) => tz.id === id)
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
            <div className="flex gap-1.5 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1 min-w-0",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1.5 size-4 shrink-0" />
                    <span className="truncate">
                      {selectedDate ? (
                        selectedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      ) : (
                        "Pick a date"
                      )}
                    </span>
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
                className="w-14 text-center shrink-0"
                placeholder="HH"
              />
              <span className="text-muted-foreground shrink-0">:</span>
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
                className="w-14 text-center shrink-0"
                placeholder="MM"
              />
              <Button
                variant="ghost"
                onClick={() => {
                  const now = new Date()
                  setHours(String(now.getHours()).padStart(2, "0"))
                  setMinutes(String(now.getMinutes()).padStart(2, "0"))
                }}
                className="shrink-0"
              >
                Now
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Source Timezone</label>
            <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone">
                  {sourceTimezone && getTimezoneById(sourceTimezone) && formatTimezoneLabel(
                    getTimezoneById(sourceTimezone)!
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_GROUPS.map((group, groupIndex) => (
                  <SelectGroup key={group.label}>
                    {groupIndex > 0 && <SelectSeparator />}
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.timezones.map((tz) => (
                      <SelectItem key={tz.id} value={tz.id}>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span>{tz.label}</span>
                          <Badge variant="outline" className="ml-1">
                            {getTimezoneOffset(tz.value)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
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
                <SelectValue placeholder="Select timezone to add">
                  {availableTimezone && getTimezoneById(availableTimezone) && formatTimezoneLabel(
                    getTimezoneById(availableTimezone)!
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_GROUPS.map((group, groupIndex) => {
                  const availableTimezones = group.timezones.filter(
                    (tz) => !targetTimezones.includes(tz.id)
                  )
                  if (availableTimezones.length === 0) return null

                  return (
                    <SelectGroup key={group.label}>
                      {groupIndex > 0 && <SelectSeparator />}
                      <SelectLabel>{group.label}</SelectLabel>
                      {availableTimezones.map((tz) => (
                        <SelectItem key={tz.id} value={tz.id}>
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span>{tz.label}</span>
                            <Badge variant="outline" className="ml-1">
                              {getTimezoneOffset(tz.value)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )
                })}
              </SelectContent>
            </Select>
            <Button onClick={addTimezone} variant="outline">
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Converted Times</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {targetTimezones.map((tzId) => {
            const timezoneData = getTimezoneById(tzId)
            const offset = timezoneData ? getTimezoneOffset(timezoneData.value) : ""
            return (
              <Card key={tzId} size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="text-sm flex-1">
                      {timezoneData?.label || tzId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="shrink-0">
                        {offset}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeTimezone(tzId)}
                        className="shrink-0"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-base">{convertTime(tzId)}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {targetTimezones.length === 0 && (
          <Card size="sm">
            <CardContent className="text-center text-muted-foreground py-8">
              No target timezones selected. Add some above to see conversions.
            </CardContent>
          </Card>
        )}
      </div>

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
