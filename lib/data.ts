export type Country = {
  code: string;
  name: string;
  flag: string;
  group: string;
  fifaRank: number;
  titles: number;
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

export const TOURNAMENT = {
  kickoff: "2026-06-11T19:00:00-06:00", // Opening match, Estadio Azteca
  final: "2026-07-19T15:00:00-04:00", // Final, MetLife Stadium
  hosts: ["USA", "Canada", "Mexico"],
  teams: 48,
  matches: 104,
  venues: 16,
};

export const COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina", flag: "🇦🇷", group: "A", fifaRank: 1, titles: 3 },
  { code: "FR", name: "France", flag: "🇫🇷", group: "B", fifaRank: 2, titles: 2 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", group: "C", fifaRank: 5, titles: 5 },
  { code: "ES", name: "Spain", flag: "🇪🇸", group: "D", fifaRank: 3, titles: 1 },
  { code: "EN", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "E", fifaRank: 4, titles: 1 },
  { code: "DE", name: "Germany", flag: "🇩🇪", group: "F", fifaRank: 10, titles: 4 },
  { code: "PT", name: "Portugal", flag: "🇵🇹", group: "G", fifaRank: 6, titles: 0 },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", group: "H", fifaRank: 7, titles: 0 },
  { code: "IT", name: "Italy", flag: "🇮🇹", group: "I", fifaRank: 9, titles: 4 },
  { code: "BE", name: "Belgium", flag: "🇧🇪", group: "J", fifaRank: 8, titles: 0 },
  { code: "MA", name: "Morocco", flag: "🇲🇦", group: "K", fifaRank: 12, titles: 0 },
  { code: "JP", name: "Japan", flag: "🇯🇵", group: "L", fifaRank: 15, titles: 0 },
];

export const PLAYERS: Player[] = [
  {
    name: "Lionel Messi",
    country: "Argentina",
    flag: "🇦🇷",
    position: "Forward",
    club: "Inter Miami",
    stats: { pace: 80, shooting: 92, passing: 96, magic: 99 },
  },
  {
    name: "Kylian Mbappé",
    country: "France",
    flag: "🇫🇷",
    position: "Forward",
    club: "Real Madrid",
    stats: { pace: 99, shooting: 93, passing: 86, magic: 92 },
  },
  {
    name: "Lamine Yamal",
    country: "Spain",
    flag: "🇪🇸",
    position: "Winger",
    club: "FC Barcelona",
    stats: { pace: 92, shooting: 86, passing: 90, magic: 95 },
  },
  {
    name: "Jude Bellingham",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    position: "Midfielder",
    club: "Real Madrid",
    stats: { pace: 84, shooting: 88, passing: 89, magic: 90 },
  },
  {
    name: "Vinícius Júnior",
    country: "Brazil",
    flag: "🇧🇷",
    position: "Winger",
    club: "Real Madrid",
    stats: { pace: 97, shooting: 87, passing: 84, magic: 93 },
  },
  {
    name: "Cristiano Ronaldo",
    country: "Portugal",
    flag: "🇵🇹",
    position: "Forward",
    club: "Al-Nassr",
    stats: { pace: 82, shooting: 94, passing: 80, magic: 91 },
  },
];

export const FIXTURES: Fixture[] = [
  {
    id: "m01",
    stage: "Group A",
    home: { name: "Mexico", flag: "🇲🇽" },
    away: { name: "South Africa", flag: "🇿🇦" },
    venue: "Estadio Azteca, Mexico City",
    kickoff: "2026-06-11T19:00:00-06:00",
    status: "upcoming",
  },
  {
    id: "m02",
    stage: "Group B",
    home: { name: "Canada", flag: "🇨🇦" },
    away: { name: "Italy", flag: "🇮🇹" },
    venue: "BMO Field, Toronto",
    kickoff: "2026-06-12T15:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m03",
    stage: "Group D",
    home: { name: "USA", flag: "🇺🇸" },
    away: { name: "Japan", flag: "🇯🇵" },
    venue: "SoFi Stadium, Los Angeles",
    kickoff: "2026-06-12T18:00:00-07:00",
    status: "upcoming",
  },
  {
    id: "m04",
    stage: "Group A",
    home: { name: "Argentina", flag: "🇦🇷" },
    away: { name: "Morocco", flag: "🇲🇦" },
    venue: "MetLife Stadium, New Jersey",
    kickoff: "2026-06-13T16:00:00-04:00",
    status: "upcoming",
  },
  {
    id: "m05",
    stage: "Group C",
    home: { name: "Brazil", flag: "🇧🇷" },
    away: { name: "Netherlands", flag: "🇳🇱" },
    venue: "AT&T Stadium, Dallas",
    kickoff: "2026-06-14T14:00:00-05:00",
    status: "upcoming",
  },
  {
    id: "m06",
    stage: "Group E",
    home: { name: "France", flag: "🇫🇷" },
    away: { name: "Germany", flag: "🇩🇪" },
    venue: "Hard Rock Stadium, Miami",
    kickoff: "2026-06-14T18:00:00-04:00",
    status: "upcoming",
  },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Aarav Shrestha", program: "BCE 4th Year", points: 940, correct: 17, streak: 6 },
  { rank: 2, name: "Sujata Karki", program: "BCT 3rd Year", points: 885, correct: 16, streak: 4 },
  { rank: 3, name: "Bibek Thapa", program: "BEI 2nd Year", points: 860, correct: 15, streak: 5 },
  { rank: 4, name: "Prerana Maharjan", program: "BAR 4th Year", points: 810, correct: 14, streak: 2 },
  { rank: 5, name: "Nischal K.C.", program: "BCE 1st Year", points: 765, correct: 13, streak: 3 },
  { rank: 6, name: "Ritika Adhikari", program: "BCT 2nd Year", points: 720, correct: 13, streak: 1 },
  { rank: 7, name: "Saugat Lamichhane", program: "BEI 3rd Year", points: 690, correct: 12, streak: 2 },
  { rank: 8, name: "Anusha Gurung", program: "BCE 2nd Year", points: 655, correct: 12, streak: 1 },
];

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
