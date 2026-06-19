import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardEntry } from "@/lib/data";
import type {
  MatchResultDetail,
  MeResponse,
  PendingPrediction,
  PersonalEntry,
} from "@/lib/me-types";
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

type DetailedPredictionRow = PredictionRow & {
  match_label: string | null;
  home_team: string | null;
  away_team: string | null;
};

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

async function buildScoredMap(supabase: SupabaseClient): Promise<{
  resultsMap: ResultMap;
  predictions: PredictionRow[];
}> {
  let resultsMap = await syncMatchResults(supabase);

  if (resultsMap.size === 0) {
    resultsMap = await loadPersistedResults(supabase);
  }

  const { data, error } = await supabase
    .from("match_predictions")
    .select("full_name, student_id, program, event_id, outcome, match_number");
  if (error) throw error;

  return {
    resultsMap,
    predictions: (data ?? []) as PredictionRow[],
  };
}

function scoreAndRank(
  predictions: PredictionRow[],
  resultsMap: ResultMap,
): {
  entries: LeaderboardEntry[];
  rankMap: Map<string, number>;
} {
  type Acc = {
    name: string;
    program: string;
    correct: number;
    calls: { dateMs: number; matchNumber: number; correct: boolean }[];
  };
  const byStudent = new Map<string, Acc>();
  const seen = new Set<string>();

  for (const p of predictions) {
    const actual = resultsMap.get(p.match_number);
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

  const entries = [...byStudent.values()]
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

  const rankedKeys = [...byStudent.entries()]
    .map(([key, a]) => ({
      key,
      name: a.name,
      points: a.correct * POINTS_PER_CORRECT,
      correct: a.correct,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.correct - a.correct ||
        a.name.localeCompare(b.name),
    );
  const rankMap = new Map(rankedKeys.map((entry, index) => [entry.key, index + 1]));

  return { entries, rankMap };
}

export function maskStudentId(id: string | null): string {
  if (!id) return "";
  if (id.length <= 4) return "***";
  return `${id.slice(0, 3)}***${id.slice(-3)}`;
}

async function fetchDetailedPredictions(
  supabase: SupabaseClient,
  field: "student_id" | "full_name",
  value: string,
): Promise<DetailedPredictionRow[]> {
  const { data, error } = await supabase
    .from("match_predictions")
    .select(
      "full_name, student_id, program, event_id, outcome, match_number, match_label, home_team, away_team",
    )
    .eq(field, value);
  if (error) throw error;
  return (data ?? []) as DetailedPredictionRow[];
}

function buildPersonalEntry(
  representative: PredictionRow,
  detailed: DetailedPredictionRow[],
  resultsMap: ResultMap,
  rank: number,
): PersonalEntry {
  const seen = new Set<number>();
  const finishedResults: MatchResultDetail[] = [];
  const pendingPredictions: PendingPrediction[] = [];

  for (const prediction of detailed) {
    if (seen.has(prediction.match_number)) continue;
    seen.add(prediction.match_number);

    const actual = resultsMap.get(prediction.match_number);
    const matchLabel = prediction.match_label ?? `Match ${prediction.match_number}`;
    const homeTeam = prediction.home_team ?? "Home team";
    const awayTeam = prediction.away_team ?? "Away team";

    if (actual) {
      const correct = prediction.outcome === actual.outcome;
      finishedResults.push({
        matchNumber: prediction.match_number,
        matchLabel,
        homeTeam,
        awayTeam,
        predicted: prediction.outcome,
        actual: actual.outcome,
        correct,
        points: correct ? POINTS_PER_CORRECT : 0,
        kickoffMs: actual.dateMs,
      });
    } else {
      pendingPredictions.push({
        matchNumber: prediction.match_number,
        matchLabel,
        homeTeam,
        awayTeam,
        predicted: prediction.outcome,
      });
    }
  }

  finishedResults.sort(
    (a, b) => a.kickoffMs - b.kickoffMs || a.matchNumber - b.matchNumber,
  );
  const correctPredictions = finishedResults.filter((result) => result.correct).length;

  return {
    fullName: representative.full_name,
    program: representative.program,
    maskedStudentId: maskStudentId(representative.student_id),
    rank,
    totalPoints: correctPredictions * POINTS_PER_CORRECT,
    correctPredictions,
    incorrectPredictions: finishedResults.length - correctPredictions,
    scoredPredictions: finishedResults.length,
    bestStreak: longestStreak(
      finishedResults.map((result) => ({
        dateMs: result.kickoffMs,
        matchNumber: result.matchNumber,
        correct: result.correct,
      })),
    ),
    scoringRule: "3 points per correct match prediction",
    finishedResults,
    pendingPredictions,
  };
}

/**
 * Build the ranked leaderboard from match predictions vs. finished fixture results.
 * 3 points per correctly predicted match winner.
 */
export async function computeLeaderboard(
  supabase: SupabaseClient,
): Promise<LeaderboardEntry[]> {
  const { resultsMap, predictions } = await buildScoredMap(supabase);
  return scoreAndRank(predictions, resultsMap).entries;
}

export async function lookupPersonalScore(
  supabase: SupabaseClient,
  query: string,
): Promise<MeResponse> {
  const queryLower = query.toLowerCase();
  const { resultsMap, predictions } = await buildScoredMap(supabase);
  const { rankMap } = scoreAndRank(predictions, resultsMap);

  const idCandidates = predictions.filter(
    (prediction) =>
      prediction.student_id != null &&
      prediction.student_id.toLowerCase() === queryLower,
  );
  if (idCandidates.length > 0) {
    const representative = idCandidates[0];
    const studentKey = representative.student_id!.toLowerCase();
    const rank = rankMap.get(studentKey) ?? 0;
    const detailed = await fetchDetailedPredictions(
      supabase,
      "student_id",
      representative.student_id!,
    );
    return {
      status: "success",
      entry: buildPersonalEntry(representative, detailed, resultsMap, rank),
    };
  }

  const nameCandidates = predictions.filter(
    (prediction) => prediction.full_name.toLowerCase() === queryLower,
  );
  if (nameCandidates.length === 0) return { status: "not_found" };

  const distinctKeys = new Set(
    nameCandidates.map((prediction) =>
      (prediction.student_id ?? `name:${prediction.full_name}`).toLowerCase(),
    ),
  );
  if (distinctKeys.size > 1) {
    return {
      status: "ambiguous",
      message:
        "Multiple students match this name. Please search by your Student or Employee ID instead.",
    };
  }

  const representative = nameCandidates[0];
  const studentKey = [...distinctKeys][0];
  const rank = rankMap.get(studentKey) ?? 0;
  const detailed = representative.student_id
    ? await fetchDetailedPredictions(
        supabase,
        "student_id",
        representative.student_id,
      )
    : await fetchDetailedPredictions(
        supabase,
        "full_name",
        representative.full_name,
      );

  return {
    status: "success",
    entry: buildPersonalEntry(representative, detailed, resultsMap, rank),
  };
}
