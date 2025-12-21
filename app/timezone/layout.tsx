import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Timezone Converter",
  description: "Convert time across different timezones easily. Select a date, time, and source timezone to see conversions for multiple target timezones around the world.",
  keywords: ["timezone converter", "time converter", "world clock", "time zones", "GMT", "UTC", "time conversion tool"],
}

export default function TimezoneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
