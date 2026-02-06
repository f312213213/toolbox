import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Timestamp Converter",
  description: "Convert Unix timestamps to human-readable dates and times. Supports both seconds and milliseconds.",
  keywords: ["timestamp", "unix time", "date converter", "time converter", "epoch", "human readable time"],
}

export default function TimestampLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
