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

export type Player = {
  name: string;
  country: string;
  flag: string;
  position: string;
  club: string;
  stats: { pace: number; shooting: number; passing: number; magic: number };
};

export type Fixture = {
  id: string;
  stage: string;
  home: { name: string; flag: string };
  away: { name: string; flag: string };
  venue: string;
  kickoff: string; // ISO
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

export const COUNTRIES: Country[] = [
  // ── GROUP A ──────────────────────────────────────────────────────────────
  {
    code: "MX", name: "Mexico", flag: "🇲🇽",
    group: "A", fifaRank: 14, titles: 0, confederation: "CONCACAF",
  },
  {
    code: "ZA", name: "South Africa", flag: "🇿🇦",
    group: "A", fifaRank: 59, titles: 0, confederation: "CAF",
  },
  {
    code: "NZ", name: "New Zealand", flag: "🇳🇿",
    group: "A", fifaRank: 96, titles: 0, confederation: "OFC",
  },
  {
    code: "TR", name: "Turkey", flag: "🇹🇷",
    group: "A", fifaRank: 25, titles: 0, confederation: "UEFA",
  },

  // ── GROUP B ──────────────────────────────────────────────────────────────
  {
    code: "US", name: "USA", flag: "🇺🇸",
    group: "B", fifaRank: 13, titles: 0, confederation: "CONCACAF",
  },
  {
    code: "MA", name: "Morocco", flag: "🇲🇦",
    group: "B", fifaRank: 12, titles: 0, confederation: "CAF",
  },
  {
    code: "JP", name: "Japan", flag: "🇯🇵",
    group: "B", fifaRank: 16, titles: 0, confederation: "AFC",
  },
  {
    code: "RS", name: "Serbia", flag: "🇷🇸",
    group: "B", fifaRank: 30, titles: 0, confederation: "UEFA",
  },

  // ── GROUP C ──────────────────────────────────────────────────────────────
  {
    code: "CA", name: "Canada", flag: "🇨🇦",
    group: "C", fifaRank: 45, titles: 0, confederation: "CONCACAF",
  },
  {
    code: "NG", name: "Nigeria", flag: "🇳🇬",
    group: "C", fifaRank: 28, titles: 0, confederation: "CAF",
  },
  {
    code: "SA", name: "Saudi Arabia", flag: "🇸🇦",
    group: "C", fifaRank: 57, titles: 0, confederation: "AFC",
  },
  {
    code: "HR", name: "Croatia", flag: "🇭🇷",
    group: "C", fifaRank: 15, titles: 0, confederation: "UEFA",
  },

  // ── GROUP D ──────────────────────────────────────────────────────────────
  {
    code: "AR", name: "Argentina", flag: "🇦🇷",
    group: "D", fifaRank: 1, titles: 3, confederation: "CONMEBOL",
  },
  {
    code: "DZ", name: "Algeria", flag: "🇩🇿",
    group: "D", fifaRank: 34, titles: 0, confederation: "CAF",
  },
  {
    code: "ID", name: "Indonesia", flag: "🇮🇩",
    group: "D", fifaRank: 125, titles: 0, confederation: "AFC", // intercontinental playoff
  },
  {
    code: "ES", name: "Spain", flag: "🇪🇸",
    group: "D", fifaRank: 3, titles: 1, confederation: "UEFA",
  },

  // ── GROUP E ──────────────────────────────────────────────────────────────
  {
    code: "BR", name: "Brazil", flag: "🇧🇷",
    group: "E", fifaRank: 5, titles: 5, confederation: "CONMEBOL",
  },
  {
    code: "EG", name: "Egypt", flag: "🇪🇬",
    group: "E", fifaRank: 32, titles: 0, confederation: "CAF",
  },
  {
    code: "KR", name: "South Korea", flag: "🇰🇷",
    group: "E", fifaRank: 22, titles: 0, confederation: "AFC",
  },
  {
    code: "PT", name: "Portugal", flag: "🇵🇹",
    group: "E", fifaRank: 6, titles: 0, confederation: "UEFA",
  },

  // ── GROUP F ──────────────────────────────────────────────────────────────
  {
    code: "FR", name: "France", flag: "🇫🇷",
    group: "F", fifaRank: 2, titles: 2, confederation: "UEFA",
  },
  {
    code: "CD", name: "DR Congo", flag: "🇨🇩",
    group: "F", fifaRank: 54, titles: 0, confederation: "CAF",
  },
  {
    code: "IR", name: "Iran", flag: "🇮🇷",
    group: "F", fifaRank: 24, titles: 0, confederation: "AFC",
  },
  {
    code: "UY", name: "Uruguay", flag: "🇺🇾",
    group: "F", fifaRank: 17, titles: 2, confederation: "CONMEBOL",
  },

  // ── GROUP G ──────────────────────────────────────────────────────────────
  {
    code: "EN", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    group: "G", fifaRank: 4, titles: 1, confederation: "UEFA",
  },
  {
    code: "CI", name: "Ivory Coast", flag: "🇨🇮",
    group: "G", fifaRank: 46, titles: 0, confederation: "CAF",
  },
  {
    code: "IQ", name: "Iraq", flag: "🇮🇶",
    group: "G", fifaRank: 55, titles: 0, confederation: "AFC",
  },
  {
    code: "CO", name: "Colombia", flag: "🇨🇴",
    group: "G", fifaRank: 11, titles: 0, confederation: "CONMEBOL",
  },

  // ── GROUP H ──────────────────────────────────────────────────────────────
  {
    code: "DE", name: "Germany", flag: "🇩🇪",
    group: "H", fifaRank: 10, titles: 4, confederation: "UEFA",
  },
  {
    code: "SN", name: "Senegal", flag: "🇸🇳",
    group: "H", fifaRank: 21, titles: 0, confederation: "CAF",
  },
  {
    code: "UZ", name: "Uzbekistan", flag: "🇺🇿",
    group: "H", fifaRank: 66, titles: 0, confederation: "AFC",
  },
  {
    code: "EC", name: "Ecuador", flag: "🇪🇨",
    group: "H", fifaRank: 35, titles: 0, confederation: "CONMEBOL",
  },

  // ── GROUP I ──────────────────────────────────────────────────────────────
  {
    code: "NL", name: "Netherlands", flag: "🇳🇱",
    group: "I", fifaRank: 7, titles: 0, confederation: "UEFA",
  },
  {
    code: "AU", name: "Australia", flag: "🇦🇺",
    group: "I", fifaRank: 23, titles: 0, confederation: "AFC",
  },
  {
    code: "VE", name: "Venezuela", flag: "🇻🇪",
    group: "I", fifaRank: 55, titles: 0, confederation: "CONMEBOL",
  },
  {
    code: "DK", name: "Denmark", flag: "🇩🇰",
    group: "I", fifaRank: 19, titles: 0, confederation: "UEFA",
  },

  // ── GROUP J ──────────────────────────────────────────────────────────────
  {
    code: "IT", name: "Italy", flag: "🇮🇹",
    group: "J", fifaRank: 9, titles: 4, confederation: "UEFA",
  },
  {
    code: "JO", name: "Jordan", flag: "🇯🇴",
    group: "J", fifaRank: 67, titles: 0, confederation: "AFC",
  },
  {
    code: "PY", name: "Paraguay", flag: "🇵🇾",
    group: "J", fifaRank: 52, titles: 0, confederation: "CONMEBOL", // intercontinental playoff
  },
  {
    code: "CH", name: "Switzerland", flag: "🇨🇭",
    group: "J", fifaRank: 18, titles: 0, confederation: "UEFA",
  },

  // ── GROUP K ──────────────────────────────────────────────────────────────
  {
    code: "BE", name: "Belgium", flag: "🇧🇪",
    group: "K", fifaRank: 8, titles: 0, confederation: "UEFA",
  },
  {
    code: "CM", name: "Cameroon", flag: "🇨🇲",
    group: "K", fifaRank: 43, titles: 0, confederation: "CAF",
  },
  {
    code: "PA", name: "Panama", flag: "🇵🇦",
    group: "K", fifaRank: 60, titles: 0, confederation: "CONCACAF",
  },
  {
    code: "AT", name: "Austria", flag: "🇦🇹",
    group: "K", fifaRank: 20, titles: 0, confederation: "UEFA",
  },

  // ── GROUP L ──────────────────────────────────────────────────────────────
  {
    code: "SC", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    group: "L", fifaRank: 38, titles: 0, confederation: "UEFA",
  },
  {
    code: "HU", name: "Hungary", flag: "🇭🇺",
    group: "L", fifaRank: 26, titles: 0, confederation: "UEFA",
  },
  {
    code: "CR", name: "Costa Rica", flag: "🇨🇷",
    group: "L", fifaRank: 50, titles: 0, confederation: "CONCACAF",
  },
  {
    code: "HN", name: "Honduras", flag: "🇭🇳",
    group: "L", fifaRank: 78, titles: 0, confederation: "CONCACAF",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Star players
// ─────────────────────────────────────────────────────────────────────────────

export const PLAYERS: Player[] = [
  {
    name: "Lionel Messi",
    country: "Argentina", flag: "🇦🇷",
    position: "Forward", club: "Inter Miami",
    stats: { pace: 80, shooting: 92, passing: 96, magic: 99 },
  },
  {
    name: "Kylian Mbappé",
    country: "France", flag: "🇫🇷",
    position: "Forward", club: "Real Madrid",
    stats: { pace: 99, shooting: 93, passing: 86, magic: 92 },
  },
  {
    name: "Lamine Yamal",
    country: "Spain", flag: "🇪🇸",
    position: "Winger", club: "FC Barcelona",
    stats: { pace: 92, shooting: 86, passing: 90, magic: 95 },
  },
  {
    name: "Jude Bellingham",
    country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "Midfielder", club: "Real Madrid",
    stats: { pace: 84, shooting: 88, passing: 89, magic: 90 },
  },
  {
    name: "Vinícius Júnior",
    country: "Brazil", flag: "🇧🇷",
    position: "Winger", club: "Real Madrid",
    stats: { pace: 97, shooting: 87, passing: 84, magic: 93 },
  },
  {
    name: "Cristiano Ronaldo",
    country: "Portugal", flag: "🇵🇹",
    position: "Forward", club: "Al-Nassr",
    stats: { pace: 82, shooting: 94, passing: 80, magic: 91 },
  },
  {
    name: "Florian Wirtz",
    country: "Germany", flag: "🇩🇪",
    position: "Attacking Mid", club: "Bayern Munich",
    stats: { pace: 85, shooting: 87, passing: 91, magic: 94 },
  },
  {
    name: "Bukayo Saka",
    country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "Winger", club: "Arsenal",
    stats: { pace: 90, shooting: 84, passing: 88, magic: 89 },
  },
  {
    name: "Son Heung-min",
    country: "South Korea", flag: "🇰🇷",
    position: "Forward", club: "Tottenham Hotspur",
    stats: { pace: 89, shooting: 88, passing: 82, magic: 88 },
  },
  {
    name: "Rafael Leão",
    country: "Portugal", flag: "🇵🇹",
    position: "Winger", club: "AC Milan",
    stats: { pace: 96, shooting: 83, passing: 80, magic: 87 },
  },
  {
    name: "Mohamed Salah",
    country: "Egypt", flag: "🇪🇬",
    position: "Forward", club: "Liverpool",
    stats: { pace: 88, shooting: 90, passing: 83, magic: 91 },
  },
  {
    name: "Cody Gakpo",
    country: "Netherlands", flag: "🇳🇱",
    position: "Forward", club: "Liverpool",
    stats: { pace: 86, shooting: 85, passing: 79, magic: 84 },
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
    title: "Official Jersey + Trophy",
    detail: "Authentic 2026 national team jersey of your choice, champion trophy, and HCOE merch pack.",
    accent: "gold" as const,
  },
  {
    place: "Runner-Up",
    title: "Match-Day Bundle",
    detail: "Premium football, HCOE varsity hoodie, and fan-zone VIP access for finals screening.",
    accent: "frost" as const,
  },
  {
    place: "Third Place",
    title: "Fan Kit",
    detail: "Scarf, cap, and HCOE fan-zone kit. Bragging rights included.",
    accent: "crimson" as const,
  },
  {
    place: "Weekly Top Predictor",
    title: "Canteen Card",
    detail: "Weekly winners take a loaded HCOE canteen card and a leaderboard spotlight.",
    accent: "turf" as const,
  },
];

export const PROGRAMS = [
  "BE Computer",
  "BE Civil",
  "BE Electronics & Communication",
  "B. Architecture",
  "Other",
];

export const HCOE_SHOWCASE = [
  {
    title: "Hackathons",
    stat: "48hr",
    copy: "Annual HimalayaHacks — students ship real products in one sleepless weekend.",
  },
  {
    title: "Robotics Club",
    stat: "12+",
    copy: "National robotics podium finishes. Built in the HCOE innovation lab.",
  },
  {
    title: "Sports Week",
    stat: "20+",
    copy: "Inter-college futsal, cricket and e-sports tournaments every semester.",
  },
  {
    title: "Engineering Projects",
    stat: "100+",
    copy: "Final-year projects solving real problems — from smart grids to flood sensing.",
  },
];
