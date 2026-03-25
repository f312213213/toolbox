import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://toolbox.chiendavid.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toolbox - Developer Utilities",
    template: "%s | Toolbox",
  },
  description: "A collection of sharp utilities for everyday dev tasks — timezone converter, Base64, URI encoder, query string parser, and Schengen calculator.",
  keywords: ["developer tools", "online utilities", "timezone converter", "base64 encoder", "uri encoder", "query string parser", "schengen calculator"],
  authors: [{ name: "David Chien" }],
  creator: "David Chien",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Toolbox",
    title: "Toolbox - Developer Utilities",
    description: "A collection of sharp utilities for everyday dev tasks — timezone converter, Base64, URI encoder, query string parser, and Schengen calculator.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolbox - Developer Utilities",
    description: "Sharp utilities for everyday dev tasks.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
