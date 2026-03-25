import type { Metadata } from "next"
import { ToolJsonLd } from "@/lib/json-ld"

export const metadata: Metadata = {
  title: "Schengen Visa Calculator",
  description: "Calculate your remaining Schengen visa-free days using the 90/180 rule. Track past trips and plan future travel within the Schengen Area.",
  keywords: ["schengen calculator", "visa calculator", "90/180 rule", "schengen area", "schengen visa days", "travel calculator", "visa-free stay calculator"],
  openGraph: {
    title: "Schengen Visa Calculator",
    description: "Calculate your remaining Schengen visa-free days using the 90/180 rule. Track trips and plan travel.",
  },
}

export default function SchengenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ToolJsonLd
        name="Schengen Visa Calculator"
        description="Calculate your remaining Schengen visa-free days using the 90/180 rule."
        path="/schengen"
      />
      {children}
    </>
  )
}
