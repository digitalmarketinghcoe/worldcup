import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import { Countdown } from "@/components/sections/countdown";
import { Predictions } from "@/components/sections/predictions";
import { MatchCenter } from "@/components/sections/match-center";
import { Leaderboard } from "@/components/sections/leaderboard";
import { Prizes } from "@/components/sections/prizes";
import { HcoeShowcase } from "@/components/sections/hcoe-showcase";
import { Footer } from "@/components/sections/footer";
import { VideoTransition } from "@/components/sections/video-transition";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldcup.hcoe.edu.np";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Himalaya College of Engineering",
      alternateName: "HCOE",
      url: "https://hcoe.edu.np",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/Himalaya_Logo_White.png`,
      },
      sameAs: ["https://hcoe.edu.np"],
    },
    {
      "@type": "Event",
      "@id": `${siteUrl}/#event`,
      name: "HCOE World Cup Fan Zone 2026",
      description:
        "Himalaya College of Engineering's FIFA World Cup 2026 Fan Zone — predict match winners, compete on the leaderboard, and win prizes.",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: siteUrl,
      },
      organizer: { "@id": `${siteUrl}/#organization` },
      url: siteUrl,
      image: `${siteUrl}/world-cup.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "HCOE World Cup Fan Zone 2026",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/#leaderboard` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <Hero />
        <Intro />
        <Countdown />
        {/* Football kick — dramatic lead-in to the prediction form */}
        <VideoTransition src="/videos/football-kick.mp4" height="60vh" brightness={0.6} fade="none" />
        <Predictions />
        {/* Stadium flythrough — cinematic break before leaderboard */}
        <VideoTransition src="/videos/stadium-flythrough.mp4" height="45vh" brightness={0.42} fade="none" />
        <Leaderboard />
        <MatchCenter />
        <Prizes />
        <HcoeShowcase />
        <Footer />
      </main>
    </>
  );
}
