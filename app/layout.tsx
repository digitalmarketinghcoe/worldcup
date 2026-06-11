import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";

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
    "Himalaya College of Engineering presents the FIFA World Cup 2026 Fan Zone. Predict matches, climb the leaderboard, win prizes. Engineering meets football.",
  keywords: [
    "HCOE",
    "Himalaya College of Engineering",
    "World Cup 2026",
    "fan zone",
    "football predictions",
    "Nepal engineering college",
  ],
  openGraph: {
    title: "HCOE World Cup Fan Zone 2026",
    description:
      "Predict. Compete. Celebrate. The FIFA World Cup 2026 fan experience, powered by HCOE.",
    url: siteUrl,
    siteName: "HCOE Fan Zone 2026",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "HCOE World Cup Fan Zone 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HCOE World Cup Fan Zone 2026",
    description: "Engineering meets football. Predict matches, win prizes.",
  },
  robots: { index: true, follow: true },
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
        <SmoothScroll>{children}</SmoothScroll>
        <div className="noise" aria-hidden="true" />
      </body>
    </html>
  );
}
