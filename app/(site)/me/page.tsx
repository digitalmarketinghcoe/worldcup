import type { Metadata } from "next";
import { MeClient } from "./MeClient";

export const metadata: Metadata = {
  title: "My Score",
  description: "Look up your World Cup 2026 prediction score and match history.",
  robots: { index: false, follow: false },
};

export default function MePage() {
  return <MeClient />;
}
