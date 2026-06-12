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

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Intro />
      <Countdown />
      {/* Football kick — dramatic lead-in to the prediction form */}
      <VideoTransition src="/videos/football-kick.mp4" height="60vh" brightness={0.6} fade="none" />
      <Predictions />
      <MatchCenter />
      {/* Stadium flythrough — cinematic break before leaderboard */}
      <VideoTransition src="/videos/stadium-flythrough.mp4" height="45vh" brightness={0.42} fade="none" />
      <Leaderboard />
      <Prizes />
      <HcoeShowcase />
      <Footer />
    </main>
  );
}
