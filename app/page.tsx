import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import { Countdown } from "@/components/sections/countdown";
import { Predictions } from "@/components/sections/predictions";
import { MatchCenter } from "@/components/sections/match-center";
import { Leaderboard } from "@/components/sections/leaderboard";
import { Prizes } from "@/components/sections/prizes";
import { HcoeShowcase } from "@/components/sections/hcoe-showcase";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Intro />
      <Countdown />
      <Predictions />
      <MatchCenter />
      <Leaderboard />
      <Prizes />
      <HcoeShowcase />
      <Footer />
    </main>
  );
}
