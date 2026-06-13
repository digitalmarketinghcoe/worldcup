import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/data";
import { fixtureLabel } from "@/lib/fixtures";
import { getFixtures } from "@/lib/fixtures-api";

// Always compute against the live clock — never statically cached.
export const dynamic = "force-dynamic";

const FLAG = new Map(COUNTRIES.map((c) => [c.name, c.flag]));

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Upcoming fixtures within the next 24 hours, sourced live from TheSportsDB.
// Only not-yet-started matches with both teams confirmed are returned.
export async function GET() {
  const now = Date.now();
  const cutoff = now + WINDOW_MS;

  const all = await getFixtures();
  const fixtures = all
    .filter((f) => {
      const kickoff = new Date(f.date).getTime();
      return (
        kickoff > now &&
        kickoff <= cutoff &&
        f.matchStatus === 0 &&
        f.homeTeam &&
        f.awayTeam &&
        f.eventId
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((f) => ({
      eventId: f.eventId,
      matchNumber: f.matchNumber,
      stage: f.stage,
      group: f.group,
      kickoff: f.date,
      venue: f.venue,
      city: f.city,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      homeFlag: FLAG.get(f.homeTeam!) ?? "🏳️",
      awayFlag: FLAG.get(f.awayTeam!) ?? "🏳️",
      label: fixtureLabel(f),
      status: f.matchStatus,
    }));

  return NextResponse.json({ ok: true, windowHours: 24, fixtures });
}
