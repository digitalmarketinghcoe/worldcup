import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardEntry } from "@/lib/data";
import { getFixtures } from "@/lib/fixtures-api";
import { fixtureLabel } from "@/lib/fixtures";

export const POINTS_PER_CORRECT = 3;
export const REFRESH_MS = 12 * 60 * 60 * 1000; // 12 hours

type Outcome = "home" | "draw" | "away";

type PredictionRow = {
  full_name: string;
  student_id: string | null;
  program: string;
  event_id: string;
  outcome: Outcome;
  match_number: number;
};

type ResultRow = {
  event_id: string;
  outcome: Outcome;
  kicked_off_at: string | null;
  match_number: number | null;
};

// Keyed by match_number (stable across API providers — event_id differs between
// TheSportsDB and ESPN, but match_number is always the official FIFA match number).
type ResultMap = Map<number, { outcome: Outcome; dateMs: number; matchNumber: number }>;

/**
 * Fetch finished matches from TheSportsDB and upsert into match_results.
 * Returns an in-memory map for immediate use — avoids a round-trip read.
 * Idempotent: safe to call on every 12h refresh.
 */
export async function syncMatchResults(supabase: SupabaseClient): Promise<ResultMap> {
  const fixtures = await getFixtures();

  const rows = [];
  const map: ResultMap = new Map();

  for (const f of fixtures) {
    if (
      f.eventId &&
      f.matchStatus === 3 &&
      f.homeScore !== null &&
      f.awayScore !== null &&
      f.homeTeam &&
      f.awayTeam
    ) {
      const outcome: Outcome =
        f.homeScore > f.awayScore ? "home" : f.homeScore < f.awayScore ? "away" : "draw";

      rows.push({
        event_id: f.eventId,
        match_number: f.matchNumber,
        match_label: fixtureLabel(f),
        home_team: f.homeTeam,
        away_team: f.awayTeam,
        home_score: f.homeScore,
        away_score: f.awayScore,
        outcome,
        kicked_off_at: f.date,
        synced_at: new Date().toISOString(),
      });

      map.set(f.matchNumber, {
        outcome,
        dateMs: new Date(f.date).getTime(),
        matchNumber: f.matchNumber,
      });
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from("match_results")
      .upsert(rows, { onConflict: "event_id" });
    if (error) console.error("match_results upsert failed:", error);
  }

  return map;
}

/**
 * Load all previously persisted match results from Supabase.
 * Used as fallback when TheSportsDB is unavailable.
 */
async function loadPersistedResults(supabase: SupabaseClient): Promise<ResultMap> {
  const map: ResultMap = new Map();
  const { data, error } = await supabase
    .from("match_results")
    .select("event_id, outcome, kicked_off_at, match_number");
  if (error) {
    console.error("match_results read failed:", error);
    return map;
  }
  for (const r of (data ?? []) as ResultRow[]) {
    if (r.match_number == null) continue;
    map.set(r.match_number, {
      outcome: r.outcome,
      dateMs: r.kicked_off_at ? new Date(r.kicked_off_at).getTime() : 0,
      matchNumber: r.match_number,
    });
  }
  return map;
}

/** Longest run of consecutive correct calls, ordered by match kickoff. */
function longestStreak(
  results: { dateMs: number; matchNumber: number; correct: boolean }[],
): number {
  const ordered = [...results].sort(
    (a, b) => a.dateMs - b.dateMs || a.matchNumber - b.matchNumber,
  );
  let best = 0;
  let run = 0;
  for (const r of ordered) {
    run = r.correct ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

/**
 * Build the ranked leaderboard from match predictions vs. finished fixture results.
 * 3 points per correctly predicted match winner.
 *
 * Flow:
 *  1. Sync finished matches from TheSportsDB → match_results (upsert, idempotent)
 *  2. If live API returned nothing, fall back to persisted match_results rows
 *  3. Score each user's predictions against actual outcomes
 */
export async function computeLeaderboard(
  supabase: SupabaseClient,
): Promise<LeaderboardEntry[]> {
  // 1. Sync live results → DB; get in-memory map for immediate use
  let results = await syncMatchResults(supabase);

  // 2. Fallback: if live API gave nothing (TheSportsDB down / no matches yet),
  //    read from previously persisted rows so history is never lost
  if (results.size === 0) {
    results = await loadPersistedResults(supabase);
  }

  // 3. Fetch all match predictions
  const { data, error } = await supabase
    .from("match_predictions")
    .select("full_name, student_id, program, event_id, outcome, match_number");
  if (error) throw error;

  const predictions = (data ?? []) as PredictionRow[];

  type Acc = {
    name: string;
    program: string;
    correct: number;
    calls: { dateMs: number; matchNumber: number; correct: boolean }[];
  };
  const byStudent = new Map<string, Acc>();
  const seen = new Set<string>();

  for (const p of predictions) {
    const actual = results.get(p.match_number);
    if (!actual) continue; // match not finished yet — skip

    // Faculty without student ID falls back to name as dedup key
    const key = (p.student_id ?? `name:${p.full_name}`).toLowerCase();
    const predictionKey = `${key}:${p.match_number}`;
    if (seen.has(predictionKey)) continue;
    seen.add(predictionKey);

    const acc = byStudent.get(key) ?? {
      name: p.full_name,
      program: p.program,
      correct: 0,
      calls: [],
    };
    const isCorrect = p.outcome === actual.outcome;
    if (isCorrect) acc.correct += 1;
    acc.calls.push({
      dateMs: actual.dateMs,
      matchNumber: actual.matchNumber,
      correct: isCorrect,
    });
    byStudent.set(key, acc);
  }

  return [...byStudent.values()]
    .map((a) => ({
      name: a.name,
      program: a.program,
      points: a.correct * POINTS_PER_CORRECT,
      correct: a.correct,
      streak: longestStreak(a.calls),
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.correct - a.correct ||
        a.name.localeCompare(b.name),
    )
    .map((e, i) => ({ rank: i + 1, ...e }));
}
