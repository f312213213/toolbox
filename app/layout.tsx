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

export const metadata: Metadata = {
  title: {
    default: "Toolbox - Useful Utilities",
    template: "%s | Toolbox",
  },
  description: "A collection of useful tools and utilities for everyday tasks.",
  keywords: ["toolbox", "utilities", "tools", "web tools", "timezone converter"],
  authors: [{ name: "David Chien" }],
  creator: "David Chien",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Toolbox",
    title: "Toolbox - Useful Utilities",
    description: "A collection of useful tools and utilities for everyday tasks.",
  },
};

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
      </body>
    </html>
  );
}
