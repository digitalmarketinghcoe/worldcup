// ─────────────────────────────────────────────────────────────────────────────
// FIFA World Cup 2026 — Official Fixture Data
//
// Source: FIFA API (api.fifa.com) · Competition 17 · Season 285023
// Fetched: 2026-06-12 · 104 matches (72 group stage + 32 knockout)
// Rules:
//   • Never invent teams, dates, venues, or pairings — API is single source of truth
//   • Knockout participants are dynamic (null until determined on-pitch)
//   • Venue names as returned by FIFA's own API
//   • matchStatus: 0=upcoming 1=live 3=finished
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export type MatchStage =
  | "First Stage"
  | "Round of 32"
  | "Round of 16"
  | "Quarter-final"
  | "Semi-final"
  | "Play-off for third place"
  | "Final";

export type MatchStatus = 0 | 1 | 3; // 0=upcoming 1=live 3=finished

export type FifaGroup =
  | "Group A" | "Group B" | "Group C" | "Group D"
  | "Group E" | "Group F" | "Group G" | "Group H"
  | "Group I" | "Group J" | "Group K" | "Group L";

export type FifaVenue =
  | "Mexico City Stadium"
  | "Guadalajara Stadium"
  | "Monterrey Stadium"
  | "Toronto Stadium"
  | "BC Place Vancouver"
  | "Los Angeles Stadium"
  | "San Francisco Bay Area Stadium"
  | "Dallas Stadium"
  | "Kansas City Stadium"
  | "Houston Stadium"
  | "New York/New Jersey Stadium"
  | "Boston Stadium"
  | "Philadelphia Stadium"
  | "Miami Stadium"
  | "Atlanta Stadium"
  | "Seattle Stadium";

export interface FifaFixture {
  /** Official FIFA match number (1–104) */
  matchNumber: number;
  /** Tournament phase */
  stage: MatchStage;
  /** Group identifier — null for knockout rounds */
  group: FifaGroup | null;
  /** ISO 8601 UTC kickoff */
  date: string;
  /** FIFA-published venue name */
  venue: FifaVenue | string;
  /** Host city */
  city: string;
  /** Full team name — null if not yet determined (knockout TBDs) */
  homeTeam: string | null;
  /** Full team name — null if not yet determined (knockout TBDs) */
  awayTeam: string | null;
  /** FIFA 3-letter abbreviation */
  homeAbbr: string | null;
  /** FIFA 3-letter abbreviation */
  awayAbbr: string | null;
  /** Seeding placeholder (e.g. "1A", "W73") */
  placeholderA: string;
  /** Seeding placeholder */
  placeholderB: string;
  /** null until match is live/finished */
  homeScore: number | null;
  /** null until match is live/finished */
  awayScore: number | null;
  /** 0=upcoming 1=live 3=finished */
  matchStatus: MatchStatus;
}

// ── Derived helpers ───────────────────────────────────────────────────────────

export const STAGE_ORDER: Record<MatchStage, number> = {
  "First Stage": 0,
  "Round of 32": 1,
  "Round of 16": 2,
  "Quarter-final": 3,
  "Semi-final": 4,
  "Play-off for third place": 5,
  "Final": 6,
};

export const VENUE_CITY: Record<string, string> = {
  "Mexico City Stadium":          "Mexico City, Mexico",
  "Guadalajara Stadium":          "Guadalajara, Mexico",
  "Monterrey Stadium":            "Monterrey, Mexico",
  "Toronto Stadium":              "Toronto, Canada",
  "BC Place Vancouver":           "Vancouver, Canada",
  "Los Angeles Stadium":          "Los Angeles, USA",
  "San Francisco Bay Area Stadium":"San Francisco Bay Area, USA",
  "Dallas Stadium":               "Dallas, USA",
  "Kansas City Stadium":          "Kansas City, USA",
  "Houston Stadium":              "Houston, USA",
  "New York/New Jersey Stadium":  "New York/New Jersey, USA",
  "Boston Stadium":               "Boston, USA",
  "Philadelphia Stadium":         "Philadelphia, USA",
  "Miami Stadium":                "Miami, USA",
  "Atlanta Stadium":              "Atlanta, USA",
  "Seattle Stadium":              "Seattle, USA",
};

/** Returns "Fixture not yet available from FIFA." for unresolved knockouts */
export function fixtureLabel(f: FifaFixture): string {
  if (!f.homeTeam || !f.awayTeam) return "Fixture not yet available from FIFA.";
  return `${f.homeTeam} vs ${f.awayTeam}`;
}

export function fixturesByGroup(group: FifaGroup): FifaFixture[] {
  return FIFA_FIXTURES.filter((f) => f.group === group).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function fixturesByStage(stage: MatchStage): FifaFixture[] {
  return FIFA_FIXTURES.filter((f) => f.stage === stage).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function liveFixtures(): FifaFixture[] {
  return FIFA_FIXTURES.filter((f) => f.matchStatus === 1);
}

export function completedFixtures(): FifaFixture[] {
  return FIFA_FIXTURES.filter((f) => f.matchStatus === 3);
}

export function upcomingFixtures(limit?: number): FifaFixture[] {
  const list = FIFA_FIXTURES.filter((f) => f.matchStatus === 0).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return limit ? list.slice(0, limit) : list;
}

// ── Official 48-team roster by group ─────────────────────────────────────────

export const FIFA_GROUPS: Record<FifaGroup, string[]> = {
  "Group A": ["Mexico", "South Africa", "Korea Republic", "Czechia"],
  "Group B": ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  "Group C": ["Brazil", "Morocco", "Haiti", "Scotland"],
  "Group D": ["USA", "Paraguay", "Australia", "Türkiye"],
  "Group E": ["Germany", "Curaçao", "Côte d'Ivoire", "Ecuador"],
  "Group F": ["Netherlands", "Japan", "Sweden", "Tunisia"],
  "Group G": ["Belgium", "Egypt", "IR Iran", "New Zealand"],
  "Group H": ["Spain", "Cabo Verde", "Saudi Arabia", "Uruguay"],
  "Group I": ["France", "Senegal", "Iraq", "Norway"],
  "Group J": ["Argentina", "Algeria", "Austria", "Jordan"],
  "Group K": ["Portugal", "Colombia", "Congo DR", "Uzbekistan"],
  "Group L": ["England", "Croatia", "Ghana", "Panama"],
};


// ── Seed data — 104 official FIFA matches ────────────────────────────────────

export const FIFA_FIXTURES: FifaFixture[] = [
  { matchNumber: 1, stage: "First Stage", group: "Group A", date: "2026-06-11T19:00:00Z", venue: "Mexico City Stadium", city: "Mexico City", homeTeam: "Mexico", awayTeam: "South Africa", homeAbbr: "MEX", awayAbbr: "RSA", placeholderA: "A1", placeholderB: "A2", homeScore: 2, awayScore: 0, matchStatus: 0 },
  { matchNumber: 2, stage: "First Stage", group: "Group A", date: "2026-06-12T02:00:00Z", venue: "Guadalajara Stadium", city: "Guadalajara", homeTeam: "Korea Republic", awayTeam: "Czechia", homeAbbr: "KOR", awayAbbr: "CZE", placeholderA: "A3", placeholderB: "A4", homeScore: 2, awayScore: 1, matchStatus: 3 },
  { matchNumber: 3, stage: "First Stage", group: "Group B", date: "2026-06-12T19:00:00Z", venue: "Toronto Stadium", city: "Toronto", homeTeam: "Canada", awayTeam: "Bosnia and Herzegovina", homeAbbr: "CAN", awayAbbr: "BIH", placeholderA: "B1", placeholderB: "B2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 4, stage: "First Stage", group: "Group D", date: "2026-06-13T01:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: "USA", awayTeam: "Paraguay", homeAbbr: "USA", awayAbbr: "PAR", placeholderA: "D1", placeholderB: "D2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 5, stage: "First Stage", group: "Group C", date: "2026-06-14T01:00:00Z", venue: "Boston Stadium", city: "Boston", homeTeam: "Haiti", awayTeam: "Scotland", homeAbbr: "HAI", awayAbbr: "SCO", placeholderA: "C3", placeholderB: "C4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 6, stage: "First Stage", group: "Group D", date: "2026-06-14T04:00:00Z", venue: "BC Place Vancouver", city: "Vancouver", homeTeam: "Australia", awayTeam: "T\u00fcrkiye", homeAbbr: "AUS", awayAbbr: "TUR", placeholderA: "D3", placeholderB: "D4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 7, stage: "First Stage", group: "Group C", date: "2026-06-13T22:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: "Brazil", awayTeam: "Morocco", homeAbbr: "BRA", awayAbbr: "MAR", placeholderA: "C1", placeholderB: "C2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 8, stage: "First Stage", group: "Group B", date: "2026-06-13T19:00:00Z", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", homeTeam: "Qatar", awayTeam: "Switzerland", homeAbbr: "QAT", awayAbbr: "SUI", placeholderA: "B3", placeholderB: "B4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 9, stage: "First Stage", group: "Group E", date: "2026-06-14T23:00:00Z", venue: "Philadelphia Stadium", city: "Philadelphia", homeTeam: "C\u00f4te d'Ivoire", awayTeam: "Ecuador", homeAbbr: "CIV", awayAbbr: "ECU", placeholderA: "E3", placeholderB: "E4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 10, stage: "First Stage", group: "Group E", date: "2026-06-14T17:00:00Z", venue: "Houston Stadium", city: "Houston", homeTeam: "Germany", awayTeam: "Cura\u00e7ao", homeAbbr: "GER", awayAbbr: "CUW", placeholderA: "E1", placeholderB: "E2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 11, stage: "First Stage", group: "Group F", date: "2026-06-14T20:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: "Netherlands", awayTeam: "Japan", homeAbbr: "NED", awayAbbr: "JPN", placeholderA: "F1", placeholderB: "F2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 12, stage: "First Stage", group: "Group F", date: "2026-06-15T02:00:00Z", venue: "Monterrey Stadium", city: "Monterrey", homeTeam: "Sweden", awayTeam: "Tunisia", homeAbbr: "SWE", awayAbbr: "TUN", placeholderA: "F3", placeholderB: "F4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 13, stage: "First Stage", group: "Group H", date: "2026-06-15T22:00:00Z", venue: "Miami Stadium", city: "Miami", homeTeam: "Saudi Arabia", awayTeam: "Uruguay", homeAbbr: "KSA", awayAbbr: "URU", placeholderA: "H3", placeholderB: "H4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 14, stage: "First Stage", group: "Group H", date: "2026-06-15T16:00:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: "Spain", awayTeam: "Cabo Verde", homeAbbr: "ESP", awayAbbr: "CPV", placeholderA: "H1", placeholderB: "H2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 15, stage: "First Stage", group: "Group G", date: "2026-06-16T01:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: "IR Iran", awayTeam: "New Zealand", homeAbbr: "IRN", awayAbbr: "NZL", placeholderA: "G3", placeholderB: "G4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 16, stage: "First Stage", group: "Group G", date: "2026-06-15T19:00:00Z", venue: "Seattle Stadium", city: "Seattle", homeTeam: "Belgium", awayTeam: "Egypt", homeAbbr: "BEL", awayAbbr: "EGY", placeholderA: "G1", placeholderB: "G2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 17, stage: "First Stage", group: "Group I", date: "2026-06-16T19:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: "France", awayTeam: "Senegal", homeAbbr: "FRA", awayAbbr: "SEN", placeholderA: "I1", placeholderB: "I2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 18, stage: "First Stage", group: "Group I", date: "2026-06-16T22:00:00Z", venue: "Boston Stadium", city: "Boston", homeTeam: "Iraq", awayTeam: "Norway", homeAbbr: "IRQ", awayAbbr: "NOR", placeholderA: "I3", placeholderB: "I4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 19, stage: "First Stage", group: "Group J", date: "2026-06-17T01:00:00Z", venue: "Kansas City Stadium", city: "Kansas City", homeTeam: "Argentina", awayTeam: "Algeria", homeAbbr: "ARG", awayAbbr: "ALG", placeholderA: "J1", placeholderB: "J2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 20, stage: "First Stage", group: "Group J", date: "2026-06-17T04:00:00Z", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", homeTeam: "Austria", awayTeam: "Jordan", homeAbbr: "AUT", awayAbbr: "JOR", placeholderA: "J3", placeholderB: "J4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 21, stage: "First Stage", group: "Group L", date: "2026-06-17T23:00:00Z", venue: "Toronto Stadium", city: "Toronto", homeTeam: "Ghana", awayTeam: "Panama", homeAbbr: "GHA", awayAbbr: "PAN", placeholderA: "L3", placeholderB: "L4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 22, stage: "First Stage", group: "Group L", date: "2026-06-17T20:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: "England", awayTeam: "Croatia", homeAbbr: "ENG", awayAbbr: "CRO", placeholderA: "L1", placeholderB: "L2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 23, stage: "First Stage", group: "Group K", date: "2026-06-17T17:00:00Z", venue: "Houston Stadium", city: "Houston", homeTeam: "Portugal", awayTeam: "Congo DR", homeAbbr: "POR", awayAbbr: "COD", placeholderA: "K1", placeholderB: "K2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 24, stage: "First Stage", group: "Group K", date: "2026-06-18T02:00:00Z", venue: "Mexico City Stadium", city: "Mexico City", homeTeam: "Uzbekistan", awayTeam: "Colombia", homeAbbr: "UZB", awayAbbr: "COL", placeholderA: "K3", placeholderB: "K4", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 25, stage: "First Stage", group: "Group A", date: "2026-06-18T16:00:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: "Czechia", awayTeam: "South Africa", homeAbbr: "CZE", awayAbbr: "RSA", placeholderA: "A4", placeholderB: "A2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 26, stage: "First Stage", group: "Group B", date: "2026-06-18T19:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: "Switzerland", awayTeam: "Bosnia and Herzegovina", homeAbbr: "SUI", awayAbbr: "BIH", placeholderA: "B4", placeholderB: "B2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 27, stage: "First Stage", group: "Group B", date: "2026-06-18T22:00:00Z", venue: "BC Place Vancouver", city: "Vancouver", homeTeam: "Canada", awayTeam: "Qatar", homeAbbr: "CAN", awayAbbr: "QAT", placeholderA: "B1", placeholderB: "B3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 28, stage: "First Stage", group: "Group A", date: "2026-06-19T01:00:00Z", venue: "Guadalajara Stadium", city: "Guadalajara", homeTeam: "Mexico", awayTeam: "Korea Republic", homeAbbr: "MEX", awayAbbr: "KOR", placeholderA: "A1", placeholderB: "A3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 29, stage: "First Stage", group: "Group C", date: "2026-06-20T00:30:00Z", venue: "Philadelphia Stadium", city: "Philadelphia", homeTeam: "Brazil", awayTeam: "Haiti", homeAbbr: "BRA", awayAbbr: "HAI", placeholderA: "C1", placeholderB: "C3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 30, stage: "First Stage", group: "Group C", date: "2026-06-19T22:00:00Z", venue: "Boston Stadium", city: "Boston", homeTeam: "Scotland", awayTeam: "Morocco", homeAbbr: "SCO", awayAbbr: "MAR", placeholderA: "C4", placeholderB: "C2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 31, stage: "First Stage", group: "Group D", date: "2026-06-20T03:00:00Z", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", homeTeam: "T\u00fcrkiye", awayTeam: "Paraguay", homeAbbr: "TUR", awayAbbr: "PAR", placeholderA: "D4", placeholderB: "D2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 32, stage: "First Stage", group: "Group D", date: "2026-06-19T19:00:00Z", venue: "Seattle Stadium", city: "Seattle", homeTeam: "USA", awayTeam: "Australia", homeAbbr: "USA", awayAbbr: "AUS", placeholderA: "D1", placeholderB: "D3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 33, stage: "First Stage", group: "Group E", date: "2026-06-20T20:00:00Z", venue: "Toronto Stadium", city: "Toronto", homeTeam: "Germany", awayTeam: "C\u00f4te d'Ivoire", homeAbbr: "GER", awayAbbr: "CIV", placeholderA: "E1", placeholderB: "E3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 34, stage: "First Stage", group: "Group E", date: "2026-06-21T00:00:00Z", venue: "Kansas City Stadium", city: "Kansas City", homeTeam: "Ecuador", awayTeam: "Cura\u00e7ao", homeAbbr: "ECU", awayAbbr: "CUW", placeholderA: "E4", placeholderB: "E2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 35, stage: "First Stage", group: "Group F", date: "2026-06-20T17:00:00Z", venue: "Houston Stadium", city: "Houston", homeTeam: "Netherlands", awayTeam: "Sweden", homeAbbr: "NED", awayAbbr: "SWE", placeholderA: "F1", placeholderB: "F3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 36, stage: "First Stage", group: "Group F", date: "2026-06-21T04:00:00Z", venue: "Monterrey Stadium", city: "Monterrey", homeTeam: "Tunisia", awayTeam: "Japan", homeAbbr: "TUN", awayAbbr: "JPN", placeholderA: "F4", placeholderB: "F2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 37, stage: "First Stage", group: "Group H", date: "2026-06-21T22:00:00Z", venue: "Miami Stadium", city: "Miami", homeTeam: "Uruguay", awayTeam: "Cabo Verde", homeAbbr: "URU", awayAbbr: "CPV", placeholderA: "H4", placeholderB: "H2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 38, stage: "First Stage", group: "Group H", date: "2026-06-21T16:00:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: "Spain", awayTeam: "Saudi Arabia", homeAbbr: "ESP", awayAbbr: "KSA", placeholderA: "H1", placeholderB: "H3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 39, stage: "First Stage", group: "Group G", date: "2026-06-21T19:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: "Belgium", awayTeam: "IR Iran", homeAbbr: "BEL", awayAbbr: "IRN", placeholderA: "G1", placeholderB: "G3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 40, stage: "First Stage", group: "Group G", date: "2026-06-22T01:00:00Z", venue: "BC Place Vancouver", city: "Vancouver", homeTeam: "New Zealand", awayTeam: "Egypt", homeAbbr: "NZL", awayAbbr: "EGY", placeholderA: "G4", placeholderB: "G2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 41, stage: "First Stage", group: "Group I", date: "2026-06-23T00:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: "Norway", awayTeam: "Senegal", homeAbbr: "NOR", awayAbbr: "SEN", placeholderA: "I4", placeholderB: "I2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 42, stage: "First Stage", group: "Group I", date: "2026-06-22T21:00:00Z", venue: "Philadelphia Stadium", city: "Philadelphia", homeTeam: "France", awayTeam: "Iraq", homeAbbr: "FRA", awayAbbr: "IRQ", placeholderA: "I1", placeholderB: "I3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 43, stage: "First Stage", group: "Group J", date: "2026-06-22T17:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: "Argentina", awayTeam: "Austria", homeAbbr: "ARG", awayAbbr: "AUT", placeholderA: "J1", placeholderB: "J3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 44, stage: "First Stage", group: "Group J", date: "2026-06-23T03:00:00Z", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", homeTeam: "Jordan", awayTeam: "Algeria", homeAbbr: "JOR", awayAbbr: "ALG", placeholderA: "J4", placeholderB: "J2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 45, stage: "First Stage", group: "Group L", date: "2026-06-23T20:00:00Z", venue: "Boston Stadium", city: "Boston", homeTeam: "England", awayTeam: "Ghana", homeAbbr: "ENG", awayAbbr: "GHA", placeholderA: "L1", placeholderB: "L3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 46, stage: "First Stage", group: "Group L", date: "2026-06-23T23:00:00Z", venue: "Toronto Stadium", city: "Toronto", homeTeam: "Panama", awayTeam: "Croatia", homeAbbr: "PAN", awayAbbr: "CRO", placeholderA: "L4", placeholderB: "L2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 47, stage: "First Stage", group: "Group K", date: "2026-06-23T17:00:00Z", venue: "Houston Stadium", city: "Houston", homeTeam: "Portugal", awayTeam: "Uzbekistan", homeAbbr: "POR", awayAbbr: "UZB", placeholderA: "K1", placeholderB: "K3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 48, stage: "First Stage", group: "Group K", date: "2026-06-24T02:00:00Z", venue: "Guadalajara Stadium", city: "Guadalajara", homeTeam: "Colombia", awayTeam: "Congo DR", homeAbbr: "COL", awayAbbr: "COD", placeholderA: "K4", placeholderB: "K2", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 49, stage: "First Stage", group: "Group C", date: "2026-06-24T22:00:00Z", venue: "Miami Stadium", city: "Miami", homeTeam: "Scotland", awayTeam: "Brazil", homeAbbr: "SCO", awayAbbr: "BRA", placeholderA: "C4", placeholderB: "C1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 50, stage: "First Stage", group: "Group C", date: "2026-06-24T22:00:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: "Morocco", awayTeam: "Haiti", homeAbbr: "MAR", awayAbbr: "HAI", placeholderA: "C2", placeholderB: "C3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 51, stage: "First Stage", group: "Group B", date: "2026-06-24T19:00:00Z", venue: "BC Place Vancouver", city: "Vancouver", homeTeam: "Switzerland", awayTeam: "Canada", homeAbbr: "SUI", awayAbbr: "CAN", placeholderA: "B4", placeholderB: "B1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 52, stage: "First Stage", group: "Group B", date: "2026-06-24T19:00:00Z", venue: "Seattle Stadium", city: "Seattle", homeTeam: "Bosnia and Herzegovina", awayTeam: "Qatar", homeAbbr: "BIH", awayAbbr: "QAT", placeholderA: "B2", placeholderB: "B3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 53, stage: "First Stage", group: "Group A", date: "2026-06-25T01:00:00Z", venue: "Mexico City Stadium", city: "Mexico City", homeTeam: "Czechia", awayTeam: "Mexico", homeAbbr: "CZE", awayAbbr: "MEX", placeholderA: "A4", placeholderB: "A1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 54, stage: "First Stage", group: "Group A", date: "2026-06-25T01:00:00Z", venue: "Monterrey Stadium", city: "Monterrey", homeTeam: "South Africa", awayTeam: "Korea Republic", homeAbbr: "RSA", awayAbbr: "KOR", placeholderA: "A2", placeholderB: "A3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 55, stage: "First Stage", group: "Group E", date: "2026-06-25T20:00:00Z", venue: "Philadelphia Stadium", city: "Philadelphia", homeTeam: "Cura\u00e7ao", awayTeam: "C\u00f4te d'Ivoire", homeAbbr: "CUW", awayAbbr: "CIV", placeholderA: "E2", placeholderB: "E3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 56, stage: "First Stage", group: "Group E", date: "2026-06-25T20:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: "Ecuador", awayTeam: "Germany", homeAbbr: "ECU", awayAbbr: "GER", placeholderA: "E4", placeholderB: "E1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 57, stage: "First Stage", group: "Group F", date: "2026-06-25T23:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: "Japan", awayTeam: "Sweden", homeAbbr: "JPN", awayAbbr: "SWE", placeholderA: "F2", placeholderB: "F3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 58, stage: "First Stage", group: "Group F", date: "2026-06-25T23:00:00Z", venue: "Kansas City Stadium", city: "Kansas City", homeTeam: "Tunisia", awayTeam: "Netherlands", homeAbbr: "TUN", awayAbbr: "NED", placeholderA: "F4", placeholderB: "F1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 59, stage: "First Stage", group: "Group D", date: "2026-06-26T02:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: "T\u00fcrkiye", awayTeam: "USA", homeAbbr: "TUR", awayAbbr: "USA", placeholderA: "D4", placeholderB: "D1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 60, stage: "First Stage", group: "Group D", date: "2026-06-26T02:00:00Z", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", homeTeam: "Paraguay", awayTeam: "Australia", homeAbbr: "PAR", awayAbbr: "AUS", placeholderA: "D2", placeholderB: "D3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 61, stage: "First Stage", group: "Group I", date: "2026-06-26T19:00:00Z", venue: "Boston Stadium", city: "Boston", homeTeam: "Norway", awayTeam: "France", homeAbbr: "NOR", awayAbbr: "FRA", placeholderA: "I4", placeholderB: "I1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 62, stage: "First Stage", group: "Group I", date: "2026-06-26T19:00:00Z", venue: "Toronto Stadium", city: "Toronto", homeTeam: "Senegal", awayTeam: "Iraq", homeAbbr: "SEN", awayAbbr: "IRQ", placeholderA: "I2", placeholderB: "I3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 63, stage: "First Stage", group: "Group G", date: "2026-06-27T03:00:00Z", venue: "Seattle Stadium", city: "Seattle", homeTeam: "Egypt", awayTeam: "IR Iran", homeAbbr: "EGY", awayAbbr: "IRN", placeholderA: "G2", placeholderB: "G3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 64, stage: "First Stage", group: "Group G", date: "2026-06-27T03:00:00Z", venue: "BC Place Vancouver", city: "Vancouver", homeTeam: "New Zealand", awayTeam: "Belgium", homeAbbr: "NZL", awayAbbr: "BEL", placeholderA: "G4", placeholderB: "G1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 65, stage: "First Stage", group: "Group H", date: "2026-06-27T00:00:00Z", venue: "Houston Stadium", city: "Houston", homeTeam: "Cabo Verde", awayTeam: "Saudi Arabia", homeAbbr: "CPV", awayAbbr: "KSA", placeholderA: "H2", placeholderB: "H3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 66, stage: "First Stage", group: "Group H", date: "2026-06-27T00:00:00Z", venue: "Guadalajara Stadium", city: "Guadalajara", homeTeam: "Uruguay", awayTeam: "Spain", homeAbbr: "URU", awayAbbr: "ESP", placeholderA: "H4", placeholderB: "H1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 67, stage: "First Stage", group: "Group L", date: "2026-06-27T21:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: "Panama", awayTeam: "England", homeAbbr: "PAN", awayAbbr: "ENG", placeholderA: "L4", placeholderB: "L1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 68, stage: "First Stage", group: "Group L", date: "2026-06-27T21:00:00Z", venue: "Philadelphia Stadium", city: "Philadelphia", homeTeam: "Croatia", awayTeam: "Ghana", homeAbbr: "CRO", awayAbbr: "GHA", placeholderA: "L2", placeholderB: "L3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 69, stage: "First Stage", group: "Group J", date: "2026-06-28T02:00:00Z", venue: "Kansas City Stadium", city: "Kansas City", homeTeam: "Algeria", awayTeam: "Austria", homeAbbr: "ALG", awayAbbr: "AUT", placeholderA: "J2", placeholderB: "J3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 70, stage: "First Stage", group: "Group J", date: "2026-06-28T02:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: "Jordan", awayTeam: "Argentina", homeAbbr: "JOR", awayAbbr: "ARG", placeholderA: "J4", placeholderB: "J1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 71, stage: "First Stage", group: "Group K", date: "2026-06-27T23:30:00Z", venue: "Miami Stadium", city: "Miami", homeTeam: "Colombia", awayTeam: "Portugal", homeAbbr: "COL", awayAbbr: "POR", placeholderA: "K4", placeholderB: "K1", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 72, stage: "First Stage", group: "Group K", date: "2026-06-27T23:30:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: "Congo DR", awayTeam: "Uzbekistan", homeAbbr: "COD", awayAbbr: "UZB", placeholderA: "K2", placeholderB: "K3", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 73, stage: "Round of 32", group: null, date: "2026-06-28T19:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "2A", placeholderB: "2B", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 74, stage: "Round of 32", group: null, date: "2026-06-29T20:30:00Z", venue: "Boston Stadium", city: "Boston", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1E", placeholderB: "3ABCDF", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 75, stage: "Round of 32", group: null, date: "2026-06-30T01:00:00Z", venue: "Monterrey Stadium", city: "Monterrey", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1F", placeholderB: "2C", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 76, stage: "Round of 32", group: null, date: "2026-06-29T17:00:00Z", venue: "Houston Stadium", city: "Houston", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1C", placeholderB: "2F", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 77, stage: "Round of 32", group: null, date: "2026-06-30T21:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1I", placeholderB: "3CDFGH", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 78, stage: "Round of 32", group: null, date: "2026-06-30T17:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "2E", placeholderB: "2I", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 79, stage: "Round of 32", group: null, date: "2026-07-01T01:00:00Z", venue: "Mexico City Stadium", city: "Mexico City", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1A", placeholderB: "3CEFHI", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 80, stage: "Round of 32", group: null, date: "2026-07-01T16:00:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1L", placeholderB: "3EHIJK", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 81, stage: "Round of 32", group: null, date: "2026-07-02T00:00:00Z", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1D", placeholderB: "3BEFIJ", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 82, stage: "Round of 32", group: null, date: "2026-07-01T20:00:00Z", venue: "Seattle Stadium", city: "Seattle", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1G", placeholderB: "3AEHIJ", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 83, stage: "Round of 32", group: null, date: "2026-07-02T23:00:00Z", venue: "Toronto Stadium", city: "Toronto", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "2K", placeholderB: "2L", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 84, stage: "Round of 32", group: null, date: "2026-07-02T19:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1H", placeholderB: "2J", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 85, stage: "Round of 32", group: null, date: "2026-07-03T03:00:00Z", venue: "BC Place Vancouver", city: "Vancouver", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1B", placeholderB: "3EFGIJ", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 86, stage: "Round of 32", group: null, date: "2026-07-03T22:00:00Z", venue: "Miami Stadium", city: "Miami", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1J", placeholderB: "2H", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 87, stage: "Round of 32", group: null, date: "2026-07-04T01:30:00Z", venue: "Kansas City Stadium", city: "Kansas City", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "1K", placeholderB: "3DEIJL", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 88, stage: "Round of 32", group: null, date: "2026-07-03T18:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "2D", placeholderB: "2G", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 89, stage: "Round of 16", group: null, date: "2026-07-04T21:00:00Z", venue: "Philadelphia Stadium", city: "Philadelphia", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W74", placeholderB: "W77", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 90, stage: "Round of 16", group: null, date: "2026-07-04T17:00:00Z", venue: "Houston Stadium", city: "Houston", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W73", placeholderB: "W75", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 91, stage: "Round of 16", group: null, date: "2026-07-05T20:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W76", placeholderB: "W78", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 92, stage: "Round of 16", group: null, date: "2026-07-06T00:00:00Z", venue: "Mexico City Stadium", city: "Mexico City", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W79", placeholderB: "W80", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 93, stage: "Round of 16", group: null, date: "2026-07-06T19:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W83", placeholderB: "W84", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 94, stage: "Round of 16", group: null, date: "2026-07-07T00:00:00Z", venue: "Seattle Stadium", city: "Seattle", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W81", placeholderB: "W82", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 95, stage: "Round of 16", group: null, date: "2026-07-07T16:00:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W86", placeholderB: "W88", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 96, stage: "Round of 16", group: null, date: "2026-07-07T20:00:00Z", venue: "BC Place Vancouver", city: "Vancouver", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W85", placeholderB: "W87", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 97, stage: "Quarter-final", group: null, date: "2026-07-09T20:00:00Z", venue: "Boston Stadium", city: "Boston", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W89", placeholderB: "W90", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 98, stage: "Quarter-final", group: null, date: "2026-07-10T19:00:00Z", venue: "Los Angeles Stadium", city: "Los Angeles", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W93", placeholderB: "W94", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 99, stage: "Quarter-final", group: null, date: "2026-07-11T21:00:00Z", venue: "Miami Stadium", city: "Miami", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W91", placeholderB: "W92", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 100, stage: "Quarter-final", group: null, date: "2026-07-12T01:00:00Z", venue: "Kansas City Stadium", city: "Kansas City", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W95", placeholderB: "W96", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 101, stage: "Semi-final", group: null, date: "2026-07-14T19:00:00Z", venue: "Dallas Stadium", city: "Dallas", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W97", placeholderB: "W98", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 102, stage: "Semi-final", group: null, date: "2026-07-15T19:00:00Z", venue: "Atlanta Stadium", city: "Atlanta", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W99", placeholderB: "W100", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 103, stage: "Play-off for third place", group: null, date: "2026-07-18T21:00:00Z", venue: "Miami Stadium", city: "Miami", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "RU101", placeholderB: "RU102", homeScore: null, awayScore: null, matchStatus: 1 },
  { matchNumber: 104, stage: "Final", group: null, date: "2026-07-19T19:00:00Z", venue: "New York/New Jersey Stadium", city: "New Jersey", homeTeam: null, awayTeam: null, homeAbbr: null, awayAbbr: null, placeholderA: "W101", placeholderB: "W102", homeScore: null, awayScore: null, matchStatus: 1 }
];
