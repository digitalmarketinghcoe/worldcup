import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/data";
import { fixturesOnDate, todayISO, fixtureLabel } from "@/lib/fixtures";
import { getFixtures } from "@/lib/fixtures-api";

// Always compute against the live clock — never statically cached.
export const dynamic = "force-dynamic";

const FLAG = new Map(COUNTRIES.map((c) => [c.name, c.flag]));

// Today's World Cup fixtures, sourced live from TheSportsDB (with static
// fallback). Only matches that are not yet finished and have both teams
// confirmed are returned — those are the ones a student can still predict.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? todayISO();

  const all = await getFixtures();
  const fixtures = fixturesOnDate(date, undefined, all)
    .filter((f) => f.matchStatus !== 3 && f.homeTeam && f.awayTeam && f.eventId)
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

  return NextResponse.json({ ok: true, date, fixtures });
}
