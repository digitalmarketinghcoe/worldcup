// ─────────────────────────────────────────────────────────────────────────────
// Live FIFA World Cup 2026 fixtures — ESPN scoreboard API
//
// Single request covers all 104 matches (group + knockout) for the full
// tournament window (2026-06-11 → 2026-07-19) with live scores + status.
// Group-stage metadata (match number, group, city, abbreviations) is inherited
// from the static dataset via canonical home__away pair lookup.
// Knockout fixtures are matched by kickoff time to the static skeleton.
//
// Falls back entirely to the static FIFA_FIXTURES array on any failure.
// ─────────────────────────────────────────────────────────────────────────────

import {
  FIFA_FIXTURES,
  FIFA_GROUPS,
  type FifaFixture,
  type FifaGroup,
  type MatchStatus,
} from "@/lib/fixtures";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200";

const REVALIDATE_SECONDS = 300;

// ESPN displayName → canonical name used in lib/data COUNTRIES / static fixtures.
const TEAM_ALIAS: Record<string, string> = {
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Cape Verde": "Cabo Verde",
  "Ivory Coast": "Côte d'Ivoire",
  Iran: "IR Iran",
  "South Korea": "Korea Republic",
  "United States": "USA",
};

function canonical(name: string): string {
  return TEAM_ALIAS[name] ?? name;
}

function isPlaceholder(name: string): boolean {
  return (
    name.includes("Winner") ||
    name.includes("Loser") ||
    name.includes("Place") ||
    name.includes("Group ")
  );
}

function mapStatus(typeName: string): MatchStatus {
  if (
    typeName === "STATUS_FULL_TIME" ||
    typeName === "STATUS_FINAL" ||
    typeName === "STATUS_FULL_PEN"
  )
    return 3;
  if (
    typeName === "STATUS_SCHEDULED" ||
    typeName === "STATUS_POSTPONED" ||
    typeName === "STATUS_CANCELLED" ||
    typeName === "STATUS_TBD"
  )
    return 0;
  return 1; // STATUS_IN_PROGRESS, STATUS_HALFTIME, etc.
}

// Reverse lookup: canonical team name → group.
const GROUP_OF = new Map<string, FifaGroup>();
for (const [group, teams] of Object.entries(FIFA_GROUPS)) {
  for (const t of teams) GROUP_OF.set(t, group as FifaGroup);
}

// Static group-stage fixtures keyed by canonical "home__away".
const STATIC_BY_PAIR = new Map<string, FifaFixture>();
for (const f of FIFA_FIXTURES) {
  if (f.stage === "First Stage" && f.homeTeam && f.awayTeam) {
    STATIC_BY_PAIR.set(`${f.homeTeam}__${f.awayTeam}`, f);
  }
}

// Static knockout fixtures keyed by kickoff time (ms) for date-based matching.
const STATIC_KNOCKOUT_BY_MS = new Map<number, FifaFixture>();
for (const f of FIFA_FIXTURES) {
  if (f.stage !== "First Stage") {
    STATIC_KNOCKOUT_BY_MS.set(new Date(f.date).getTime(), f);
  }
}

type EspnTeam = {
  homeAway: "home" | "away";
  score: string | null;
  team: { id: string; displayName: string; shortDisplayName: string };
};

type EspnEvent = {
  id: string;
  date: string;
  name: string;
  competitions: Array<{
    status: { type: { name: string; completed?: boolean } };
    venue?: { fullName?: string; address?: { city?: string } };
    competitors: EspnTeam[];
  }>;
};

function toFixture(e: EspnEvent, idx: number): FifaFixture {
  const comp = e.competitions[0];
  const teams = comp.competitors;
  const homeTeamRaw = teams.find((t) => t.homeAway === "home");
  const awayTeamRaw = teams.find((t) => t.homeAway === "away");

  const homeRaw = homeTeamRaw?.team.displayName ?? "";
  const awayRaw = awayTeamRaw?.team.displayName ?? "";
  const homeTeam = isPlaceholder(homeRaw) ? null : canonical(homeRaw);
  const awayTeam = isPlaceholder(awayRaw) ? null : canonical(awayRaw);

  const matchStatus = mapStatus(comp.status.type.name);
  const homeScore =
    matchStatus !== 0 && homeTeamRaw?.score != null
      ? Number(homeTeamRaw.score)
      : null;
  const awayScore =
    matchStatus !== 0 && awayTeamRaw?.score != null
      ? Number(awayTeamRaw.score)
      : null;

  // Group stage: inherit metadata from static fixture by canonical pair.
  if (homeTeam && awayTeam) {
    const staticMatch = STATIC_BY_PAIR.get(`${homeTeam}__${awayTeam}`);
    if (staticMatch) {
      return {
        ...staticMatch,
        date: e.date,
        homeScore,
        awayScore,
        matchStatus,
        eventId: e.id,
      };
    }
  }

  // Knockout stage: match by kickoff time to static skeleton.
  const kickoffMs = new Date(e.date).getTime();
  const staticKnockout = STATIC_KNOCKOUT_BY_MS.get(kickoffMs);
  if (staticKnockout) {
    return {
      ...staticKnockout,
      // Overwrite teams only when ESPN now knows the real participants.
      homeTeam: homeTeam ?? staticKnockout.homeTeam,
      awayTeam: awayTeam ?? staticKnockout.awayTeam,
      homeScore,
      awayScore,
      matchStatus,
      eventId: e.id,
    };
  }

  // Fallback: build a minimal fixture from ESPN data alone.
  return {
    matchNumber: 900 + idx,
    stage: "First Stage",
    group: homeTeam ? (GROUP_OF.get(homeTeam) ?? null) : null,
    date: e.date,
    venue: comp.venue?.fullName ?? "",
    city: comp.venue?.address?.city ?? "",
    homeTeam,
    awayTeam,
    homeAbbr: null,
    awayAbbr: null,
    placeholderA: homeRaw,
    placeholderB: awayRaw,
    homeScore,
    awayScore,
    matchStatus,
    eventId: e.id,
  };
}

let warned = false;

/**
 * All World Cup 2026 fixtures with live scores from ESPN.
 * Single network request covers all 104 matches.
 * Falls back to static dataset on error.
 */
export async function getFixtures(): Promise<FifaFixture[]> {
  try {
    const res = await fetch(ESPN_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`ESPN scoreboard: HTTP ${res.status}`);
    const data = (await res.json()) as { events?: EspnEvent[] };
    const events = data.events ?? [];
    if (events.length === 0) throw new Error("ESPN returned no events");

    const fixtures = events
      .map((e, i) => toFixture(e, i))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Fill any static fixtures not matched by ESPN (defensive — shouldn't happen).
    const seenEventIds = new Set(fixtures.map((f) => f.eventId).filter(Boolean));
    const seenPairs = new Set(
      fixtures
        .filter((f) => f.homeTeam && f.awayTeam)
        .map((f) => `${f.homeTeam}__${f.awayTeam}`),
    );
    const fill = FIFA_FIXTURES.filter(
      (f) =>
        f.homeTeam &&
        f.awayTeam &&
        !seenPairs.has(`${f.homeTeam}__${f.awayTeam}`) &&
        !seenEventIds.has(f.eventId ?? ""),
    );

    return [...fixtures, ...fill].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  } catch (err) {
    if (!warned) {
      console.warn("ESPN fixtures unavailable — using static fallback:", err);
      warned = true;
    }
    return FIFA_FIXTURES;
  }
}

/** Find a single fixture by its ESPN event id. */
export async function getFixtureByEventId(
  eventId: string,
): Promise<FifaFixture | null> {
  const all = await getFixtures();
  return all.find((f) => f.eventId === eventId) ?? null;
}
