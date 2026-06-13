import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/data";
import { fixtureLabel } from "@/lib/fixtures";
import { getFixtures } from "@/lib/fixtures-api";

// Refresh live scores periodically; safe to cache between refreshes.
export const revalidate = 300;

const FLAG = new Map(COUNTRIES.map((c) => [c.name, c.flag]));

// All World Cup 2026 fixtures (live group stage + knockout skeleton), enriched
// with flags + a display label. Consumed by the Match Center.
export async function GET() {
  const all = await getFixtures();
  const fixtures = all.map((f) => ({
    eventId: f.eventId ?? null,
    matchNumber: f.matchNumber,
    stage: f.stage,
    group: f.group,
    kickoff: f.date,
    venue: f.venue,
    city: f.city,
    homeTeam: f.homeTeam,
    awayTeam: f.awayTeam,
    homeAbbr: f.homeAbbr,
    awayAbbr: f.awayAbbr,
    homeFlag: f.homeTeam ? FLAG.get(f.homeTeam) ?? "🏳️" : "🏳️",
    awayFlag: f.awayTeam ? FLAG.get(f.awayTeam) ?? "🏳️" : "🏳️",
    homeScore: f.homeScore,
    awayScore: f.awayScore,
    label: fixtureLabel(f),
    status: f.matchStatus,
    placeholderA: f.placeholderA,
    placeholderB: f.placeholderB,
  }));

  return NextResponse.json({ ok: true, fixtures });
}
