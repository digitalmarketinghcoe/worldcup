import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Navbar } from "@/components/sections/navbar";
import { FloatingCta } from "@/components/sections/floating-cta";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldcup.hcoe.edu.np";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HCOE World Cup Fan Zone 2026 — Engineering Meets Football",
    template: "%s | HCOE Fan Zone 2026",
  },
  description:
    "Himalaya College of Engineering presents the FIFA World Cup 2026 Fan Zone. Predict match winners, climb the leaderboard, and win prizes. Join students and faculty at HCOE Nepal.",
  keywords: [
    "HCOE",
    "Himalaya College of Engineering",
    "FIFA World Cup 2026",
    "World Cup 2026 Nepal",
    "fan zone",
    "football predictions",
    "match predictions",
    "Nepal engineering college",
    "USA Canada Mexico 2026",
    "leaderboard",
    "prize cabinet",
    "World Cup fan experience",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "HCOE World Cup Fan Zone 2026 — Engineering Meets Football",
    description:
      "Predict. Compete. Celebrate. The FIFA World Cup 2026 fan experience, powered by Himalaya College of Engineering, Nepal.",
    url: siteUrl,
    siteName: "HCOE Fan Zone 2026",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HCOE World Cup Fan Zone 2026",
    description:
      "Engineering meets football. Predict match winners, climb the leaderboard, win prizes. Powered by Himalaya College of Engineering, Nepal.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${inter.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-pitch text-frost">
        <Navbar />
        <SmoothScroll>{children}</SmoothScroll>
        <FloatingCta />
        <div className="noise" aria-hidden="true" />
      </body>
    </html>
  );
}
