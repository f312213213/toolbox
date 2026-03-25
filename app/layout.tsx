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
    default: "Toolbox — Free Online Developer Utilities & Converters",
    template: "%s | Toolbox",
  },
  description: "Free online developer tools — timezone converter, Base64 encoder/decoder, URI encoder, query string parser, and Schengen visa calculator.",
  keywords: ["developer tools", "online utilities", "timezone converter", "base64 encoder", "uri encoder", "query string parser", "schengen calculator"],
  authors: [{ name: "David Chien" }],
  creator: "David Chien",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Toolbox",
    title: "Toolbox — Free Online Developer Utilities & Converters",
    description: "Free online developer tools — timezone converter, Base64 encoder/decoder, URI encoder, query string parser, and Schengen visa calculator.",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Toolbox — Free Online Developer Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolbox — Free Online Developer Utilities & Converters",
    description: "Free online developer tools — timezone, Base64, URI, query string, and Schengen calculator.",
    images: [`${SITE_URL}/opengraph-image`],
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
