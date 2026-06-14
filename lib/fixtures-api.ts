// ─────────────────────────────────────────────────────────────────────────────
// Live FIFA World Cup 2026 fixtures — TheSportsDB
//
// League 4429 ("FIFA World Cup"), season 2026. The free API serves the 72
// group-stage matches round-by-round (intRound 1–3) with live scores + status.
// Knockout fixtures (matches 73–104) are not published by the provider yet
// (participants are TBD), so they come from the static skeleton in lib/fixtures.
//
// On any network/parse failure the whole thing falls back to the static
// FIFA_FIXTURES array, so the site keeps working offline / if the API is down.
// ─────────────────────────────────────────────────────────────────────────────

import {
  FIFA_FIXTURES,
  FIFA_GROUPS,
  type FifaFixture,
  type FifaGroup,
  type MatchStatus,
} from "@/lib/fixtures";

const KEY = process.env.THESPORTSDB_KEY ?? "3"; // "3" = free public test key
const LEAGUE = "4429";
const SEASON = "2026";
const REVALIDATE_SECONDS = 300; // refresh live scores at most every 5 min

// TheSportsDB team name → canonical name used in lib/data COUNTRIES.
const TEAM_ALIAS: Record<string, string> = {
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Cape Verde": "Cabo Verde",
  "Czech Republic": "Czechia",
  "DR Congo": "Congo DR",
  Iran: "IR Iran",
  "Ivory Coast": "Côte d'Ivoire",
  "South Korea": "Korea Republic",
  Turkey: "Türkiye",
};

function canonical(name: string): string {
  return TEAM_ALIAS[name] ?? name;
}

// Reverse lookup: canonical team name → group.
const GROUP_OF = new Map<string, FifaGroup>();
for (const [group, teams] of Object.entries(FIFA_GROUPS)) {
  for (const t of teams) GROUP_OF.set(t, group as FifaGroup);
}

// Static group-stage fixtures keyed by canonical "home__away" — used to inherit
// the official FIFA match number, city, and venue for live matches.
const STATIC_BY_PAIR = new Map<string, FifaFixture>();
for (const f of FIFA_FIXTURES) {
  if (f.stage === "First Stage" && f.homeTeam && f.awayTeam) {
    STATIC_BY_PAIR.set(`${f.homeTeam}__${f.awayTeam}`, f);
  }
}

// Knockout skeleton (everything past the group stage) from the static dataset.
const KNOCKOUT_SKELETON = FIFA_FIXTURES.filter((f) => f.stage !== "First Stage");

type SportsDbEvent = {
  idEvent: string;
  strTimestamp: string | null;
  dateEvent: string | null;
  strTime: string | null;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strVenue: string | null;
  strCountry: string | null;
  intRound: string | null;
  strStatus: string | null;
};

function mapStatus(raw: string | null): MatchStatus {
  if (!raw) return 0;
  const s = raw.toUpperCase();
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(s)) return 3; // finished
  if (["NS", "TBD", "PST", "CANC", "ABD", ""].includes(s)) return 0; // not started
  return 1; // 1H, HT, 2H, ET, BT, LIVE, P …
}

function toUtcIso(e: SportsDbEvent): string {
  // strTimestamp is UTC but lacks a "Z" suffix; normalise it.
  if (e.strTimestamp) {
    return e.strTimestamp.endsWith("Z") ? e.strTimestamp : `${e.strTimestamp}Z`;
  }
  if (e.dateEvent) return `${e.dateEvent}T${e.strTime ?? "00:00:00"}Z`;
  return new Date().toISOString();
}

function toFixture(e: SportsDbEvent, idx: number): FifaFixture {
  const home = canonical(e.strHomeTeam);
  const away = canonical(e.strAwayTeam);
  const staticMatch = STATIC_BY_PAIR.get(`${home}__${away}`);

  return {
    matchNumber: staticMatch?.matchNumber ?? 900 + idx,
    stage: "First Stage",
    group: GROUP_OF.get(home) ?? null,
    date: toUtcIso(e),
    venue: e.strVenue ?? staticMatch?.venue ?? "",
    city: staticMatch?.city ?? e.strCountry ?? "",
    homeTeam: home,
    awayTeam: away,
    homeAbbr: staticMatch?.homeAbbr ?? null,
    awayAbbr: staticMatch?.awayAbbr ?? null,
    placeholderA: staticMatch?.placeholderA ?? "",
    placeholderB: staticMatch?.placeholderB ?? "",
    homeScore: e.intHomeScore != null ? Number(e.intHomeScore) : null,
    awayScore: e.intAwayScore != null ? Number(e.intAwayScore) : null,
    matchStatus: mapStatus(e.strStatus),
    eventId: e.idEvent,
  };
}

async function fetchRound(round: number): Promise<SportsDbEvent[]> {
  const url = `https://www.thesportsdb.com/api/v1/json/${KEY}/eventsround.php?id=${LEAGUE}&r=${round}&s=${SEASON}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`TheSportsDB round ${round}: HTTP ${res.status}`);
  const data = (await res.json()) as { events: SportsDbEvent[] | null };
  return data.events ?? [];
}

let warned = false;

/**
 * All World Cup 2026 fixtures: live group stage (TheSportsDB) merged with the
 * static knockout skeleton. Falls back entirely to the static dataset on error.
 */
export async function getFixtures(): Promise<FifaFixture[]> {
  try {
    const rounds = await Promise.all([fetchRound(1), fetchRound(2), fetchRound(3)]);
    const events = rounds.flat();
    if (events.length === 0) throw new Error("TheSportsDB returned no group-stage events");

    const live = events.map(toFixture);

    // Free API key may only return a subset of group-stage matches.
    // Back-fill from the static dataset for any pair not returned live,
    // so the full 72-match group stage is always present.
    const livePairs = new Set(live.map((f) => `${f.homeTeam}__${f.awayTeam}`));
    const staticFill = FIFA_FIXTURES.filter(
      (f) =>
        f.stage === "First Stage" &&
        f.homeTeam &&
        f.awayTeam &&
        !livePairs.has(`${f.homeTeam}__${f.awayTeam}`),
    );

    const merged = [...live, ...staticFill, ...KNOCKOUT_SKELETON].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return merged;
  } catch (err) {
    if (!warned) {
      console.warn("Live fixtures unavailable — using static fallback:", err);
      warned = true;
    }
    return FIFA_FIXTURES;
  }
}

/** Find a single fixture by its provider event id (live matches only). */
export async function getFixtureByEventId(eventId: string): Promise<FifaFixture | null> {
  const all = await getFixtures();
  return all.find((f) => f.eventId === eventId) ?? null;
}
