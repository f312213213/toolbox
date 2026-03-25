import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Schengen Visa Calculator",
  description: "Calculate your remaining Schengen visa-free days using the 90/180 rule. Track your travel history and plan future trips within the Schengen Area.",
  keywords: ["schengen calculator", "visa calculator", "90/180 rule", "schengen area", "travel days", "visa-free stay"],
}

export default function SchengenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
