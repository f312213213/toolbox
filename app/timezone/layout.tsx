import type { Metadata } from "next"
import { ToolJsonLd } from "@/lib/json-ld"

export const metadata: Metadata = {
  title: "Timezone Converter",
  description: "Convert time across different timezones. Select a date, time, and source timezone to see conversions for multiple cities worldwide.",
  keywords: ["timezone converter", "time converter", "world clock", "time zones", "GMT", "UTC", "time conversion tool"],
  openGraph: {
    title: "Timezone Converter",
    description: "Convert time across different timezones. Select a date, time, and source timezone to see conversions for multiple cities worldwide.",
  },
}

export default function TimezoneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ToolJsonLd
        name="Timezone Converter"
        description="Convert time across different timezones with support for 100+ cities worldwide."
        path="/timezone"
      />
      {children}
    </>
  )
}
