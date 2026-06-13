export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "AFC" | "CAF" | "OFC";

export type Country = {
  code: string;
  name: string;
  flag: string;
  group: string;
  fifaRank: number;
  titles: number;
  confederation: Confederation;
};

// Stats are real-world figures — not game ratings.
// intl* = career international (national team). club* = 2024–25 club season.
// null means data was not available from a verified source.
// Sources: Wikipedia / official federation records (as of Aug 2025).
// Photos: TheSportsDB (thesportsdb.com).
export type PlayerStats = {
  intlCaps: number | null;
  intlGoals: number | null;
  intlAssists: number | null;
  clubGoals: number | null;
  clubAssists: number | null;
};

export type Player = {
  name: string;
  country: string;
  flag: string;
  position: string;
  club: string;
  photo: string;
  imageSource: string;
  sourceUrl: string;
  stats: PlayerStats;
};

// Legacy Fixture type kept for backwards compat with match-center.tsx
// New code should import FifaFixture from lib/fixtures.ts
export type Fixture = {
  id: string;
  stage: string;
  home: { name: string; flag: string };
  away: { name: string; flag: string };
  venue: string;
  kickoff: string;
  status: "upcoming" | "live" | "finished";
  score?: { home: number; away: number };
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  program: string;
  points: number;
  correct: number;
  streak: number;
};

// Re-export FIFA fixture data as canonical source
export { FIFA_FIXTURES, FIFA_GROUPS, fixturesByGroup, fixturesByStage, fixtureLabel, upcomingFixtures, liveFixtures, completedFixtures } from "@/lib/fixtures";

// ─────────────────────────────────────────────────────────────────────────────
// Tournament meta
// ─────────────────────────────────────────────────────────────────────────────

export const TOURNAMENT = {
  kickoff: "2026-06-11T19:00:00-06:00", // Opening — Estadio Azteca, Mexico City
  final: "2026-07-19T15:00:00-04:00",   // Final   — MetLife Stadium, New Jersey
  hosts: ["USA", "Canada", "Mexico"],
  teams: 48,
  matches: 104,
  venues: 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// All 48 qualified nations
//
// Group assignments are the anticipated draw distribution (groups A–L, 4 teams
// each). FIFA rankings approximate late-2025 official standings. WC titles are
// total first-place finishes in FIFA World Cup history.
//
// Allocation: UEFA 16 · CAF 9 · AFC 8+1(playoff) · CONMEBOL 6+1(playoff)
//             CONCACAF 6 (hosts included) · OFC 1
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 48 qualified nations — groups sourced from FIFA API (api.fifa.com, comp 17,
// season 285023). FIFA ranks approximate late-2025. WC titles exact.
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRIES: Country[] = [
  // ── GROUP A — Mexico · South Africa · Korea Republic · Czechia ──────────
  { code: "MX",  name: "Mexico",                  flag: "🇲🇽", group: "A", fifaRank: 14,  titles: 0, confederation: "CONCACAF" },
  { code: "ZA",  name: "South Africa",             flag: "🇿🇦", group: "A", fifaRank: 59,  titles: 0, confederation: "CAF"      },
  { code: "KOR", name: "Korea Republic",           flag: "🇰🇷", group: "A", fifaRank: 22,  titles: 0, confederation: "AFC"      },
  { code: "CZE", name: "Czechia",                  flag: "🇨🇿", group: "A", fifaRank: 37,  titles: 0, confederation: "UEFA"     },

  // ── GROUP B — Canada · Bosnia and Herzegovina · Qatar · Switzerland ──────
  { code: "CA",  name: "Canada",                   flag: "🇨🇦", group: "B", fifaRank: 43,  titles: 0, confederation: "CONCACAF" },
  { code: "BIH", name: "Bosnia and Herzegovina",   flag: "🇧🇦", group: "B", fifaRank: 61,  titles: 0, confederation: "UEFA"     },
  { code: "QAT", name: "Qatar",                    flag: "🇶🇦", group: "B", fifaRank: 37,  titles: 0, confederation: "AFC"      },
  { code: "SUI", name: "Switzerland",              flag: "🇨🇭", group: "B", fifaRank: 18,  titles: 0, confederation: "UEFA"     },

  // ── GROUP C — Brazil · Morocco · Haiti · Scotland ────────────────────────
  { code: "BR",  name: "Brazil",                   flag: "🇧🇷", group: "C", fifaRank: 5,   titles: 5, confederation: "CONMEBOL" },
  { code: "MA",  name: "Morocco",                  flag: "🇲🇦", group: "C", fifaRank: 12,  titles: 0, confederation: "CAF"      },
  { code: "HAI", name: "Haiti",                    flag: "🇭🇹", group: "C", fifaRank: 82,  titles: 0, confederation: "CONCACAF" },
  { code: "SCO", name: "Scotland",                 flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", fifaRank: 38,  titles: 0, confederation: "UEFA"     },

  // ── GROUP D — USA · Paraguay · Australia · Türkiye ───────────────────────
  { code: "US",  name: "USA",                      flag: "🇺🇸", group: "D", fifaRank: 13,  titles: 0, confederation: "CONCACAF" },
  { code: "PAR", name: "Paraguay",                 flag: "🇵🇾", group: "D", fifaRank: 52,  titles: 0, confederation: "CONMEBOL" },
  { code: "AUS", name: "Australia",                flag: "🇦🇺", group: "D", fifaRank: 23,  titles: 0, confederation: "AFC"      },
  { code: "TUR", name: "Türkiye",                  flag: "🇹🇷", group: "D", fifaRank: 25,  titles: 0, confederation: "UEFA"     },

  // ── GROUP E — Germany · Curaçao · Côte d'Ivoire · Ecuador ───────────────
  { code: "DE",  name: "Germany",                  flag: "🇩🇪", group: "E", fifaRank: 10,  titles: 4, confederation: "UEFA"     },
  { code: "CUW", name: "Curaçao",                  flag: "🇨🇼", group: "E", fifaRank: 94,  titles: 0, confederation: "CONCACAF" },
  { code: "CIV", name: "Côte d'Ivoire",            flag: "🇨🇮", group: "E", fifaRank: 46,  titles: 0, confederation: "CAF"      },
  { code: "EC",  name: "Ecuador",                  flag: "🇪🇨", group: "E", fifaRank: 35,  titles: 0, confederation: "CONMEBOL" },

  // ── GROUP F — Netherlands · Japan · Sweden · Tunisia ─────────────────────
  { code: "NL",  name: "Netherlands",              flag: "🇳🇱", group: "F", fifaRank: 7,   titles: 0, confederation: "UEFA"     },
  { code: "JP",  name: "Japan",                    flag: "🇯🇵", group: "F", fifaRank: 16,  titles: 0, confederation: "AFC"      },
  { code: "SWE", name: "Sweden",                   flag: "🇸🇪", group: "F", fifaRank: 24,  titles: 0, confederation: "UEFA"     },
  { code: "TUN", name: "Tunisia",                  flag: "🇹🇳", group: "F", fifaRank: 30,  titles: 0, confederation: "CAF"      },

  // ── GROUP G — Belgium · Egypt · IR Iran · New Zealand ────────────────────
  { code: "BE",  name: "Belgium",                  flag: "🇧🇪", group: "G", fifaRank: 8,   titles: 0, confederation: "UEFA"     },
  { code: "EG",  name: "Egypt",                    flag: "🇪🇬", group: "G", fifaRank: 32,  titles: 0, confederation: "CAF"      },
  { code: "IRN", name: "IR Iran",                  flag: "🇮🇷", group: "G", fifaRank: 24,  titles: 0, confederation: "AFC"      },
  { code: "NZ",  name: "New Zealand",              flag: "🇳🇿", group: "G", fifaRank: 96,  titles: 0, confederation: "OFC"      },

  // ── GROUP H — Spain · Cabo Verde · Saudi Arabia · Uruguay ────────────────
  { code: "ES",  name: "Spain",                    flag: "🇪🇸", group: "H", fifaRank: 3,   titles: 1, confederation: "UEFA"     },
  { code: "CPV", name: "Cabo Verde",               flag: "🇨🇻", group: "H", fifaRank: 68,  titles: 0, confederation: "CAF"      },
  { code: "KSA", name: "Saudi Arabia",             flag: "🇸🇦", group: "H", fifaRank: 57,  titles: 0, confederation: "AFC"      },
  { code: "UY",  name: "Uruguay",                  flag: "🇺🇾", group: "H", fifaRank: 17,  titles: 2, confederation: "CONMEBOL" },

  // ── GROUP I — France · Senegal · Iraq · Norway ───────────────────────────
  { code: "FR",  name: "France",                   flag: "🇫🇷", group: "I", fifaRank: 2,   titles: 2, confederation: "UEFA"     },
  { code: "SEN", name: "Senegal",                  flag: "🇸🇳", group: "I", fifaRank: 21,  titles: 0, confederation: "CAF"      },
  { code: "IRQ", name: "Iraq",                     flag: "🇮🇶", group: "I", fifaRank: 55,  titles: 0, confederation: "AFC"      },
  { code: "NOR", name: "Norway",                   flag: "🇳🇴", group: "I", fifaRank: 25,  titles: 0, confederation: "UEFA"     },

  // ── GROUP J — Argentina · Algeria · Austria · Jordan ─────────────────────
  { code: "AR",  name: "Argentina",                flag: "🇦🇷", group: "J", fifaRank: 1,   titles: 3, confederation: "CONMEBOL" },
  { code: "DZ",  name: "Algeria",                  flag: "🇩🇿", group: "J", fifaRank: 34,  titles: 0, confederation: "CAF"      },
  { code: "AT",  name: "Austria",                  flag: "🇦🇹", group: "J", fifaRank: 20,  titles: 0, confederation: "UEFA"     },
  { code: "JOR", name: "Jordan",                   flag: "🇯🇴", group: "J", fifaRank: 67,  titles: 0, confederation: "AFC"      },

  // ── GROUP K — Portugal · Colombia · Congo DR · Uzbekistan ────────────────
  { code: "PT",  name: "Portugal",                 flag: "🇵🇹", group: "K", fifaRank: 6,   titles: 0, confederation: "UEFA"     },
  { code: "CO",  name: "Colombia",                 flag: "🇨🇴", group: "K", fifaRank: 11,  titles: 0, confederation: "CONMEBOL" },
  { code: "COD", name: "Congo DR",                 flag: "🇨🇩", group: "K", fifaRank: 54,  titles: 0, confederation: "CAF"      },
  { code: "UZB", name: "Uzbekistan",               flag: "🇺🇿", group: "K", fifaRank: 66,  titles: 0, confederation: "AFC"      },

  // ── GROUP L — England · Croatia · Ghana · Panama ─────────────────────────
  { code: "EN",  name: "England",                  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", fifaRank: 4,   titles: 1, confederation: "UEFA"     },
  { code: "HR",  name: "Croatia",                  flag: "🇭🇷", group: "L", fifaRank: 15,  titles: 0, confederation: "UEFA"     },
  { code: "GHA", name: "Ghana",                    flag: "🇬🇭", group: "L", fifaRank: 53,  titles: 0, confederation: "CAF"      },
  { code: "PA",  name: "Panama",                   flag: "🇵🇦", group: "L", fifaRank: 60,  titles: 0, confederation: "CONCACAF" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Star players
// ─────────────────────────────────────────────────────────────────────────────

// ─── Stat normalisation maxes (used by PlayerCard bars) ──────────────────────
// intlCaps: Ronaldo 214 is all-time high among active players
// intlGoals: Ronaldo 133
// clubGoals / clubAssists: top of this squad in 2024-25
export const PLAYER_STAT_MAX = {
  intlCaps: 220,
  intlGoals: 135,
  clubGoals: 35,
  clubAssists: 25,
} as const;

// ─── Star players ─────────────────────────────────────────────────────────────
// Photos: TheSportsDB cutout API — all URLs verified 200, no hotlink protection.
// Stats: career international (national team) + 2024-25 club season.
// Sources: Wikipedia / official federation records as of Aug 2025.
// FIFA API (api.fifa.com/api/v3) does not expose public player-stat endpoints —
//   /squads returns 404, /players rejects GET, /stats/players returns 404.
// TheSportsDB free tier returns photos + identity only — no stat fields.
// null = figure not available from a verified source at knowledge cutoff.
export const PLAYERS: Player[] = [
  {
    name: "Lionel Messi",
    country: "Argentina", flag: "🇦🇷",
    position: "Forward", club: "Inter Miami",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/e0i2051750317027.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34146370",
    // Career intl: Argentina (source: Wikipedia / AFA)
    // Club 2024-25: MLS season timing complex — null
    stats: { intlCaps: 191, intlGoals: 109, intlAssists: 56, clubGoals: null, clubAssists: null },
  },
  {
    name: "Kylian Mbappé",
    country: "France", flag: "🇫🇷",
    position: "Forward", club: "Real Madrid",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/h9u9vz1733653583.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34169652",
    // Career intl: France (source: Wikipedia / FFF)
    // Club 2024-25: Real Madrid La Liga + UCL (source: Wikipedia)
    stats: { intlCaps: 97, intlGoals: 57, intlAssists: 36, clubGoals: 32, clubAssists: 11 },
  },
  {
    name: "Lamine Yamal",
    country: "Spain", flag: "🇪🇸",
    position: "Winger", club: "FC Barcelona",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/m9n4ja1761512633.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34182793",
    // Career intl: Spain (source: Wikipedia / RFEF) — born 2007, emerging star
    // Club 2024-25: FC Barcelona La Liga (source: Wikipedia)
    stats: { intlCaps: 26, intlGoals: 7, intlAssists: 13, clubGoals: 15, clubAssists: 22 },
  },
  {
    name: "Jude Bellingham",
    country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "Midfielder", club: "Real Madrid",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/trk5271750271712.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34173700",
    // Career intl: England (source: Wikipedia / FA)
    // Club 2024-25: Real Madrid La Liga + UCL (source: Wikipedia)
    stats: { intlCaps: 52, intlGoals: 13, intlAssists: 5, clubGoals: 24, clubAssists: 8 },
  },
  {
    name: "Vinícius Júnior",
    country: "Brazil", flag: "🇧🇷",
    position: "Winger", club: "Real Madrid",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/ejuxsh1750271859.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34163718",
    // Career intl: Brazil (source: Wikipedia / CBF)
    // Club 2024-25: Real Madrid La Liga + UCL (source: Wikipedia)
    stats: { intlCaps: 56, intlGoals: 19, intlAssists: 18, clubGoals: 22, clubAssists: 8 },
  },
  {
    name: "Cristiano Ronaldo",
    country: "Portugal", flag: "🇵🇹",
    position: "Forward", club: "Al-Nassr",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/a19jje1761592498.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34146444",
    // Career intl: Portugal — all-time men's international scoring record (source: Wikipedia / FPF)
    // Club 2024-25: Saudi Pro League stats — null (insufficient verified data at cutoff)
    stats: { intlCaps: 214, intlGoals: 133, intlAssists: 43, clubGoals: null, clubAssists: null },
  },
  {
    name: "Florian Wirtz",
    country: "Germany", flag: "🇩🇪",
    position: "Attacking Mid", club: "Bayern Munich",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/8t6bzo1757088899.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34182019",
    // Career intl: Germany (source: Wikipedia / DFB)
    // Club 2024-25: moved to Bayern Munich mid-cycle — null (exact figure uncertain at cutoff)
    stats: { intlCaps: 36, intlGoals: 11, intlAssists: 12, clubGoals: null, clubAssists: null },
  },
  {
    name: "Bukayo Saka",
    country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "Winger", club: "Arsenal",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/xfwok41769331816.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34173747",
    // Career intl: England (source: Wikipedia / FA)
    // Club 2024-25: Arsenal Premier League + UCL (source: Wikipedia)
    stats: { intlCaps: 58, intlGoals: 17, intlAssists: 18, clubGoals: 18, clubAssists: 14 },
  },
  {
    name: "Son Heung-min",
    country: "Korea Republic", flag: "🇰🇷",
    position: "Forward", club: "Tottenham Hotspur",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/a5cqf81766425262.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34152636",
    // Career intl: Korea Republic — KFA all-time top scorer (source: Wikipedia / KFA)
    // Club 2024-25: Tottenham Premier League (source: Wikipedia)
    stats: { intlCaps: 139, intlGoals: 47, intlAssists: 16, clubGoals: 15, clubAssists: 9 },
  },
  {
    name: "Rafael Leão",
    country: "Portugal", flag: "🇵🇹",
    position: "Winger", club: "AC Milan",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/tlgrvf1758892567.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34164960",
    // Career intl: Portugal (source: Wikipedia / FPF)
    // Club 2024-25: AC Milan Serie A (source: Wikipedia)
    stats: { intlCaps: 37, intlGoals: 8, intlAssists: 9, clubGoals: 12, clubAssists: 9 },
  },
  {
    name: "Mohamed Salah",
    country: "Egypt", flag: "🇪🇬",
    position: "Forward", club: "Liverpool",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/3blc581757088735.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34146806",
    // Career intl: Egypt (source: Wikipedia / EFA)
    // Club 2024-25: Liverpool Premier League (source: Wikipedia)
    stats: { intlCaps: 101, intlGoals: 56, intlAssists: 27, clubGoals: 29, clubAssists: 18 },
  },
  {
    name: "Cody Gakpo",
    country: "Netherlands", flag: "🇳🇱",
    position: "Forward", club: "Liverpool",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/lwkl5n1757088091.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34169110",
    // Career intl: Netherlands (source: Wikipedia / KNVB)
    // Club 2024-25: Liverpool Premier League (source: Wikipedia)
    stats: { intlCaps: 46, intlGoals: 17, intlAssists: 9, clubGoals: 17, clubAssists: 8 },
  },
  {
    name: "Harry Kane",
    country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "Forward", club: "Bayern Munich",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/j4ouvd1756408895.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34146220",
    // Career intl: England all-time top scorer (source: Wikipedia / FA)
    // Club 2024-25: Bayern Munich Bundesliga (source: Wikipedia)
    stats: { intlCaps: 98, intlGoals: 68, intlAssists: 18, clubGoals: 25, clubAssists: 8 },
  },
  {
    name: "Kevin De Bruyne",
    country: "Belgium", flag: "🇧🇪",
    position: "Midfielder", club: "Napoli",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/o4flia1764089447.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34155057",
    // Career intl: Belgium (source: Wikipedia / RBFA)
    // Club 2024-25: moved to Napoli mid-cycle — club stats null
    stats: { intlCaps: 105, intlGoals: 26, intlAssists: 44, clubGoals: null, clubAssists: null },
  },
  {
    name: "Antoine Griezmann",
    country: "France", flag: "🇫🇷",
    position: "Forward", club: "Atlético Madrid",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/tiqhh41762288400.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34159231",
    // Career intl: France, second all-time top scorer (source: Wikipedia / FFF)
    // Club 2024-25: Atlético Madrid La Liga (source: Wikipedia)
    stats: { intlCaps: 137, intlGoals: 44, intlAssists: 30, clubGoals: 10, clubAssists: 9 },
  },
  {
    name: "Phil Foden",
    country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "Midfielder", club: "Manchester City",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/lbn4sx1769182620.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34163136",
    // Career intl: England (source: Wikipedia / FA)
    // Club 2024-25: Manchester City Premier League (source: Wikipedia)
    stats: { intlCaps: 43, intlGoals: 4, intlAssists: 9, clubGoals: 15, clubAssists: 8 },
  },
  {
    name: "Lautaro Martínez",
    country: "Argentina", flag: "🇦🇷",
    position: "Forward", club: "Inter Milan",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/vwxq811759408924.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34164252",
    // Career intl: Argentina (source: Wikipedia / AFA)
    // Club 2024-25: Inter Milan Serie A (source: Wikipedia)
    stats: { intlCaps: 67, intlGoals: 31, intlAssists: 9, clubGoals: 22, clubAssists: 4 },
  },
  {
    name: "Erling Haaland",
    country: "Norway", flag: "🇳🇴",
    position: "Forward", club: "Manchester City",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/un3jr11769182465.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34169116",
    // Career intl: Norway (source: Wikipedia / NFF)
    // Club 2024-25: Manchester City Premier League (source: Wikipedia)
    stats: { intlCaps: 34, intlGoals: 31, intlAssists: 7, clubGoals: 27, clubAssists: 5 },
  },
  {
    name: "Rodri",
    country: "Spain", flag: "🇪🇸",
    position: "Midfielder", club: "Manchester City",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/6ggnc31769182523.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34163415",
    // Career intl: Spain, Ballon d'Or 2024 (source: Wikipedia / RFEF)
    // Club 2024-25: ACL injury — limited appearances, club stats null
    stats: { intlCaps: 53, intlGoals: 8, intlAssists: 9, clubGoals: null, clubAssists: null },
  },
  {
    name: "Pedri",
    country: "Spain", flag: "🇪🇸",
    position: "Midfielder", club: "FC Barcelona",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/82xtuu1726509836.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34172243",
    // Career intl: Spain (source: Wikipedia / RFEF)
    // Club 2024-25: FC Barcelona La Liga (source: Wikipedia)
    stats: { intlCaps: 41, intlGoals: 8, intlAssists: 9, clubGoals: 13, clubAssists: 8 },
  },
  {
    name: "Nicolo Barella",
    country: "Italy", flag: "🇮🇹",
    position: "Midfielder", club: "Inter Milan",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/k03sge1759408783.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34148307",
    // Career intl: Italy (source: Wikipedia / FIGC)
    // Club 2024-25: Inter Milan Serie A (source: Wikipedia)
    stats: { intlCaps: 64, intlGoals: 8, intlAssists: 16, clubGoals: 4, clubAssists: 11 },
  },
  {
    name: "Federico Valverde",
    country: "Uruguay", flag: "🇺🇾",
    position: "Midfielder", club: "Real Madrid",
    photo: "https://r2.thesportsdb.com/images/media/player/cutout/5249151768499204.png",
    imageSource: "TheSportsDB",
    sourceUrl: "https://www.thesportsdb.com/player/34164200",
    // Career intl: Uruguay (source: Wikipedia / AUF)
    // Club 2024-25: Real Madrid La Liga + UCL (source: Wikipedia)
    stats: { intlCaps: 56, intlGoals: 9, intlAssists: 8, clubGoals: 11, clubAssists: 8 },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures — opening match per group + marquee matchups
// Venues: 10 USA · 2 Canada · 3 Mexico · 1 shared (total 16)
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURES: Fixture[] = [
  // ── Group A openers
  {
    id: "m01",
    stage: "Group A",
    home: { name: "Mexico", flag: "🇲🇽" },
    away: { name: "Turkey", flag: "🇹🇷" },
    venue: "Estadio Azteca, Mexico City",
    kickoff: "2026-06-11T19:00:00-06:00",
    status: "upcoming",
  },
  {
    id: "m02",
    stage: "Group A",
    home: { name: "South Africa", flag: "🇿🇦" },
    away: { name: "New Zealand", flag: "🇳🇿" },
    venue: "Estadio Akron, Guadalajara",
    kickoff: "2026-06-12T13:00:00-06:00",
    status: "upcoming",
  },
  // ── Group B openers
  {
    id: "m03",
    stage: "Group B",
    home: { name: "USA", flag: "🇺🇸" },
    away: { name: "Serbia", flag: "🇷🇸" },
    venue: "MetLife Stadium, New Jersey",
    kickoff: "2026-06-12T16:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m04",
    stage: "Group B",
    home: { name: "Morocco", flag: "🇲🇦" },
    away: { name: "Japan", flag: "🇯🇵" },
    venue: "Hard Rock Stadium, Miami",
    kickoff: "2026-06-12T20:00:00-04:00",
    status: "upcoming",
  },
  // ── Group C openers
  {
    id: "m05",
    stage: "Group C",
    home: { name: "Canada", flag: "🇨🇦" },
    away: { name: "Croatia", flag: "🇭🇷" },
    venue: "BMO Field, Toronto",
    kickoff: "2026-06-13T15:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m06",
    stage: "Group C",
    home: { name: "Nigeria", flag: "🇳🇬" },
    away: { name: "Saudi Arabia", flag: "🇸🇦" },
    venue: "BC Place, Vancouver",
    kickoff: "2026-06-13T20:00:00-04:00",
    status: "upcoming",
  },
  // ── Group D — marquee: Argentina vs Spain
  {
    id: "m07",
    stage: "Group D",
    home: { name: "Argentina", flag: "🇦🇷" },
    away: { name: "Algeria", flag: "🇩🇿" },
    venue: "Rose Bowl, Pasadena",
    kickoff: "2026-06-13T21:00:00-07:00",
    status: "upcoming",
  },
  {
    id: "m08",
    stage: "Group D",
    home: { name: "Spain", flag: "🇪🇸" },
    away: { name: "Indonesia", flag: "🇮🇩" },
    venue: "AT&T Stadium, Dallas",
    kickoff: "2026-06-14T13:00:00-05:00",
    status: "upcoming",
  },
  // ── Group E
  {
    id: "m09",
    stage: "Group E",
    home: { name: "Brazil", flag: "🇧🇷" },
    away: { name: "South Korea", flag: "🇰🇷" },
    venue: "SoFi Stadium, Los Angeles",
    kickoff: "2026-06-14T16:00:00-07:00",
    status: "upcoming",
  },
  {
    id: "m10",
    stage: "Group E",
    home: { name: "Portugal", flag: "🇵🇹" },
    away: { name: "Egypt", flag: "🇪🇬" },
    venue: "Levi's Stadium, San Jose",
    kickoff: "2026-06-15T14:00:00-07:00",
    status: "upcoming",
  },
  // ── Group F — marquee: France vs Uruguay
  {
    id: "m11",
    stage: "Group F",
    home: { name: "France", flag: "🇫🇷" },
    away: { name: "Uruguay", flag: "🇺🇾" },
    venue: "Arrowhead Stadium, Kansas City",
    kickoff: "2026-06-15T17:00:00-05:00",
    status: "upcoming",
  },
  {
    id: "m12",
    stage: "Group F",
    home: { name: "DR Congo", flag: "🇨🇩" },
    away: { name: "Iran", flag: "🇮🇷" },
    venue: "Gillette Stadium, Boston",
    kickoff: "2026-06-15T20:00:00-04:00",
    status: "upcoming",
  },
  // ── Group G — marquee: England vs Colombia
  {
    id: "m13",
    stage: "Group G",
    home: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    away: { name: "Iraq", flag: "🇮🇶" },
    venue: "Mercedes-Benz Stadium, Atlanta",
    kickoff: "2026-06-16T16:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m14",
    stage: "Group G",
    home: { name: "Colombia", flag: "🇨🇴" },
    away: { name: "Ivory Coast", flag: "🇨🇮" },
    venue: "Lincoln Financial Field, Philadelphia",
    kickoff: "2026-06-16T20:00:00-04:00",
    status: "upcoming",
  },
  // ── Group H — marquee: Germany vs Ecuador
  {
    id: "m15",
    stage: "Group H",
    home: { name: "Germany", flag: "🇩🇪" },
    away: { name: "Ecuador", flag: "🇪🇨" },
    venue: "Estadio BBVA, Monterrey",
    kickoff: "2026-06-17T17:00:00-06:00",
    status: "upcoming",
  },
  {
    id: "m16",
    stage: "Group H",
    home: { name: "Senegal", flag: "🇸🇳" },
    away: { name: "Uzbekistan", flag: "🇺🇿" },
    venue: "AT&T Stadium, Dallas",
    kickoff: "2026-06-17T20:00:00-05:00",
    status: "upcoming",
  },
  // ── Groups I–L
  {
    id: "m17",
    stage: "Group I",
    home: { name: "Netherlands", flag: "🇳🇱" },
    away: { name: "Denmark", flag: "🇩🇰" },
    venue: "MetLife Stadium, New Jersey",
    kickoff: "2026-06-18T16:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m18",
    stage: "Group I",
    home: { name: "Australia", flag: "🇦🇺" },
    away: { name: "Venezuela", flag: "🇻🇪" },
    venue: "Hard Rock Stadium, Miami",
    kickoff: "2026-06-18T20:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m19",
    stage: "Group J",
    home: { name: "Italy", flag: "🇮🇹" },
    away: { name: "Switzerland", flag: "🇨🇭" },
    venue: "Rose Bowl, Pasadena",
    kickoff: "2026-06-19T17:00:00-07:00",
    status: "upcoming",
  },
  {
    id: "m20",
    stage: "Group J",
    home: { name: "Paraguay", flag: "🇵🇾" },
    away: { name: "Jordan", flag: "🇯🇴" },
    venue: "Levi's Stadium, San Jose",
    kickoff: "2026-06-19T20:00:00-07:00",
    status: "upcoming",
  },
  {
    id: "m21",
    stage: "Group K",
    home: { name: "Belgium", flag: "🇧🇪" },
    away: { name: "Austria", flag: "🇦🇹" },
    venue: "Lincoln Financial Field, Philadelphia",
    kickoff: "2026-06-20T16:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m22",
    stage: "Group K",
    home: { name: "Cameroon", flag: "🇨🇲" },
    away: { name: "Panama", flag: "🇵🇦" },
    venue: "Mercedes-Benz Stadium, Atlanta",
    kickoff: "2026-06-20T20:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m23",
    stage: "Group L",
    home: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    away: { name: "Hungary", flag: "🇭🇺" },
    venue: "Gillette Stadium, Boston",
    kickoff: "2026-06-21T16:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m24",
    stage: "Group L",
    home: { name: "Costa Rica", flag: "🇨🇷" },
    away: { name: "Honduras", flag: "🇭🇳" },
    venue: "Arrowhead Stadium, Kansas City",
    kickoff: "2026-06-21T20:00:00-05:00",
    status: "upcoming",
  },
  // ── Group D marquee: Argentina vs Spain (matchday 2)
  {
    id: "m25",
    stage: "Group D — MD2",
    home: { name: "Argentina", flag: "🇦🇷" },
    away: { name: "Spain", flag: "🇪🇸" },
    venue: "SoFi Stadium, Los Angeles",
    kickoff: "2026-06-25T21:00:00-07:00",
    status: "upcoming",
  },
  // ── Group E marquee: Brazil vs Portugal (matchday 2)
  {
    id: "m26",
    stage: "Group E — MD2",
    home: { name: "Brazil", flag: "🇧🇷" },
    away: { name: "Portugal", flag: "🇵🇹" },
    venue: "MetLife Stadium, New Jersey",
    kickoff: "2026-06-26T20:00:00-04:00",
    status: "upcoming",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard (seed — replaced by sheet data in production)
// ─────────────────────────────────────────────────────────────────────────────

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Aarav Shrestha",    program: "BCE 4th Year", points: 940, correct: 17, streak: 6 },
  { rank: 2, name: "Sujata Karki",      program: "BCT 3rd Year", points: 885, correct: 16, streak: 4 },
  { rank: 3, name: "Bibek Thapa",       program: "BEI 2nd Year", points: 860, correct: 15, streak: 5 },
  { rank: 4, name: "Prerana Maharjan",  program: "BAR 4th Year", points: 810, correct: 14, streak: 2 },
  { rank: 5, name: "Nischal K.C.",      program: "BCE 1st Year", points: 765, correct: 13, streak: 3 },
  { rank: 6, name: "Ritika Adhikari",   program: "BCT 2nd Year", points: 720, correct: 13, streak: 1 },
  { rank: 7, name: "Saugat Lamichhane", program: "BEI 3rd Year", points: 690, correct: 12, streak: 2 },
  { rank: 8, name: "Anusha Gurung",     program: "BCE 2nd Year", points: 655, correct: 12, streak: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Prizes, programs, showcase
// ─────────────────────────────────────────────────────────────────────────────

export const PRIZES = [
  {
    place: "Champion",
    title: "Winning Jersey",
    detail: "2026 national team jersey of your choice and Trophy.",
    accent: "gold" as const,
  },
  {
    place: "Runner-Up",
    title: "Match-Day Bundle",
    detail: "Premium football.",
    accent: "frost" as const,
  },
  {
    place: "Third Place",
    title: "Fan Kit",
    detail: "Scarf, cap, and HCOE fan-zone kit. Bragging rights included.",
    accent: "crimson" as const,
  },
];

export const PROGRAMS = [
  "BE Computer",
  "BE Civil",
  "BE Electronics & Communication",
  "B. Architecture",
  "Bsc.CSIT",
  "BCA",
  "Faculty",
];

export const HCOE_SHOWCASE = [
  {
    title: "Hackathons",
    stat: "48hr",
    copy: "Annual Codeyatra — students ship real products in one sleepless weekend.",
  },
  {
    title: "Robotics Club",
    stat: "12+",
    copy: "National robotics podium finishes. Built in the HCOE innovation lab.",
  },
  {
    title: "Sports Week",
    stat: "20+",
    copy: "Inter-college futsal, cricket and e-sports tournaments every year.",
  },
  {
    title: "Engineering Projects",
    stat: "100+",
    copy: "Final-year projects solving real problems — from smart grids to flood sensing.",
  },
];
