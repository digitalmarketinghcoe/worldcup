import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { selectAll } from "@/lib/supabase-server";
import type { LeaderboardEntry } from "@/lib/data";
import type {
  MatchResultDetail,
  MeResponse,
  PendingPrediction,
  PersonalEntry,
} from "@/lib/me-types";
import { getFixtures } from "@/lib/fixtures-api";
import { fixtureLabel } from "@/lib/fixtures";
import {
  scoreTournamentPrediction,
  type TournamentPrediction,
} from "@/lib/tournament-scoring";
import { applyFinalPointsOverride } from "@/lib/final-winners";

export const POINTS_PER_CORRECT = 3;
export const REFRESH_MS = 12 * 60 * 60 * 1000; // 12 hours

type Outcome = "home" | "draw" | "away";

type MatchPredictionRow = {
  full_name: string;
  student_id: string | null;
  program: string;
  event_id: string;
  outcome: Outcome;
  match_number: number;
};

type TournamentPredictionRow = TournamentPrediction & {
  full_name: string;
  student_id: string | null;
  program: string;
};

type ResultRow = {
  event_id: string;
  outcome: Outcome;
  kicked_off_at: string | null;
  match_number: number | null;
};

// Index by both provider event ID and official match number. Current ESPN rows
// use the exact event ID; match number keeps legacy-provider predictions valid.
type MatchResult = { outcome: Outcome; dateMs: number; matchNumber: number };
type ResultIndex = {
  byEventId: Map<string, MatchResult>;
  byMatchNumber: Map<number, MatchResult>;
};

type DetailedPredictionRow = MatchPredictionRow & {
  match_label: string | null;
  home_team: string | null;
  away_team: string | null;
};

/**
 * Fetch finished matches from ESPN and upsert into match_results.
 * Returns an in-memory map for immediate use — avoids a round-trip read.
 * Idempotent: safe to call on every 12h refresh.
 */
export async function syncMatchResults(supabase: SupabaseClient): Promise<ResultIndex> {
  const fixtures = await getFixtures();

  const rows = [];
  const byEventId = new Map<string, MatchResult>();
  const byMatchNumber = new Map<number, MatchResult>();

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

      const result = {
        outcome,
        dateMs: new Date(f.date).getTime(),
        matchNumber: f.matchNumber,
      };
      byEventId.set(f.eventId, result);
      // Some knockout fixtures could not be matched to the original static
      // schedule. Do not let their generated 900-series numbers overwrite an
      // official match-number result.
      if (f.matchNumber <= 104) byMatchNumber.set(f.matchNumber, result);
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from("match_results")
      .upsert(rows, { onConflict: "event_id" });
    if (error) console.error("match_results upsert failed:", error);
  }

  return { byEventId, byMatchNumber };
}

/**
 * Load all previously persisted match results from Supabase.
 * Used as fallback when ESPN is unavailable.
 */
async function loadPersistedResults(supabase: SupabaseClient): Promise<ResultIndex> {
  const byEventId = new Map<string, MatchResult>();
  const byMatchNumber = new Map<number, MatchResult>();
  const { data, error } = await supabase
    .from("match_results")
    .select("event_id, outcome, kicked_off_at, match_number");
  if (error) {
    console.error("match_results read failed:", error);
    return { byEventId, byMatchNumber };
  }
  for (const r of (data ?? []) as ResultRow[]) {
    if (r.match_number == null) continue;
    const result = {
      outcome: r.outcome,
      dateMs: r.kicked_off_at ? new Date(r.kicked_off_at).getTime() : 0,
      matchNumber: r.match_number,
    };
    byEventId.set(r.event_id, result);
    if (r.match_number <= 104) byMatchNumber.set(r.match_number, result);
  }
  return { byEventId, byMatchNumber };
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

type ScoredMap = {
  results: ResultIndex;
  matchPredictions: MatchPredictionRow[];
  tournamentPredictions: TournamentPredictionRow[];
};

async function computeScoredMap(supabase: SupabaseClient): Promise<ScoredMap> {
  let results = await syncMatchResults(supabase);

  if (results.byEventId.size === 0 && results.byMatchNumber.size === 0) {
    results = await loadPersistedResults(supabase);
  }

  // selectAll pages past PostgREST's 1000-row cap. Without it, predictions
  // beyond row 1000 are silently dropped, so those students/faculty vanish
  // from the leaderboard. Order by `id` for stable, gap-free pagination.
  const [matchPredictions, tournamentPredictions] = await Promise.all([
    selectAll<MatchPredictionRow>(
      supabase
        .from("match_predictions")
        .select("full_name, student_id, program, event_id, outcome, match_number")
        .order("id", { ascending: true }),
    ),
    selectAll<TournamentPredictionRow>(
      supabase
        .from("predictions")
        .select(
          "full_name, student_id, program, golden_ball, golden_boot, young_player, golden_gloves, final_score, final_team, final_match_goal_scorer, first_place, second_place, third_place",
        )
        .order("id", { ascending: true }),
    ),
  ]);

  return { results, matchPredictions, tournamentPredictions };
}

// Scoring loads every prediction (10+ paginated reads at 10k rows) plus an
// external fixtures sync. Both the public leaderboard and every personal
// /api/me lookup need it, so without caching a traffic spike would fan out one
// full-table scan per request. Memoize the scored map with a short TTL and
// coalesce concurrent callers onto a single in-flight computation — under load
// thousands of lookups collapse to one DB pass every SCORED_TTL_MS.
const SCORED_TTL_MS = 30_000;
let scoredCache: { at: number; value: ScoredMap } | null = null;
let scoredInflight: Promise<ScoredMap> | null = null;

async function buildScoredMap(supabase: SupabaseClient): Promise<ScoredMap> {
  if (scoredCache && Date.now() - scoredCache.at < SCORED_TTL_MS) {
    return scoredCache.value;
  }
  // A computation is already running — ride it instead of starting another.
  if (scoredInflight) return scoredInflight;

  scoredInflight = (async () => {
    try {
      const value = await computeScoredMap(supabase);
      scoredCache = { at: Date.now(), value };
      return value;
    } finally {
      scoredInflight = null;
    }
  })();
  return scoredInflight;
}

function scoreAndRank(
  matchPredictions: MatchPredictionRow[],
  tournamentPredictions: TournamentPredictionRow[],
  results: ResultIndex,
): {
  entries: LeaderboardEntry[];
  rankMap: Map<string, number>;
} {
  type Acc = {
    name: string;
    studentId: string | null;
    program: string;
    matchCorrect: number;
    tournamentCorrect: number;
    tournamentPoints: number;
    calls: { dateMs: number; matchNumber: number; correct: boolean }[];
  };
  const byStudent = new Map<string, Acc>();
  const seen = new Set<string>();

  for (const p of matchPredictions) {
    // ESPN event IDs are exact. Match number remains the compatibility path
    // for the handful of early predictions stored with legacy provider IDs.
    const actual =
      results.byEventId.get(p.event_id) ??
      results.byMatchNumber.get(p.match_number);
    if (!actual) continue; // match not finished yet — skip

    // Faculty without student ID falls back to name as dedup key
    const key = (p.student_id ?? `name:${p.full_name}`).toLowerCase();
    const predictionKey = `${key}:${p.match_number}`;
    if (seen.has(predictionKey)) continue;
    seen.add(predictionKey);

    const acc = byStudent.get(key) ?? {
      name: p.full_name,
      studentId: p.student_id,
      program: p.program,
      matchCorrect: 0,
      tournamentCorrect: 0,
      tournamentPoints: 0,
      calls: [],
    };
    const isCorrect = p.outcome === actual.outcome;
    if (isCorrect) acc.matchCorrect += 1;
    acc.calls.push({
      dateMs: actual.dateMs,
      matchNumber: actual.matchNumber,
      correct: isCorrect,
    });
    byStudent.set(key, acc);
  }

  for (const prediction of tournamentPredictions) {
    const key = (prediction.student_id ?? `name:${prediction.full_name}`).toLowerCase();
    const acc = byStudent.get(key) ?? {
      name: prediction.full_name,
      studentId: prediction.student_id,
      program: prediction.program,
      matchCorrect: 0,
      tournamentCorrect: 0,
      tournamentPoints: 0,
      calls: [],
    };
    const tournamentScore = scoreTournamentPrediction(prediction);
    acc.tournamentCorrect = tournamentScore.correct;
    acc.tournamentPoints = tournamentScore.points;
    byStudent.set(key, acc);
  }

  const entries = [...byStudent.values()]
    .map((a) => {
      const matchPoints = a.matchCorrect * POINTS_PER_CORRECT;
      const computedPoints = matchPoints + a.tournamentPoints;
      const points = applyFinalPointsOverride(a.name, a.studentId, computedPoints);
      return {
        name: a.name,
        program: a.program,
        points,
        matchPoints,
        tournamentPoints: a.tournamentPoints,
        manualAdjustment: points - computedPoints,
        correct: a.matchCorrect + a.tournamentCorrect,
        streak: longestStreak(a.calls),
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.correct - a.correct ||
        a.name.localeCompare(b.name),
    )
    .map((e, i) => ({ rank: i + 1, ...e }));

  const rankedKeys = [...byStudent.entries()]
    .map(([key, a]) => {
      const computedPoints = a.matchCorrect * POINTS_PER_CORRECT + a.tournamentPoints;
      return {
        key,
        name: a.name,
        points: applyFinalPointsOverride(a.name, a.studentId, computedPoints),
        correct: a.matchCorrect + a.tournamentCorrect,
      };
    })
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
  representative: Pick<MatchPredictionRow, "full_name" | "student_id" | "program">,
  detailed: DetailedPredictionRow[],
  results: ResultIndex,
  tournamentPrediction: TournamentPredictionRow | undefined,
  rank: number,
): PersonalEntry {
  const seen = new Set<number>();
  const finishedResults: MatchResultDetail[] = [];
  const pendingPredictions: PendingPrediction[] = [];

  for (const prediction of detailed) {
    if (seen.has(prediction.match_number)) continue;
    seen.add(prediction.match_number);

    const actual =
      results.byEventId.get(prediction.event_id) ??
      results.byMatchNumber.get(prediction.match_number);
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
  const tournamentScore = tournamentPrediction
    ? scoreTournamentPrediction(tournamentPrediction)
    : { correct: 0, points: 0 };
  const computedPoints = correctPredictions * POINTS_PER_CORRECT + tournamentScore.points;
  const totalPoints = applyFinalPointsOverride(
    representative.full_name,
    representative.student_id,
    computedPoints,
  );

  return {
    fullName: representative.full_name,
    program: representative.program,
    maskedStudentId: maskStudentId(representative.student_id),
    rank,
    totalPoints,
    matchPoints: correctPredictions * POINTS_PER_CORRECT,
    tournamentPoints: tournamentScore.points,
    manualAdjustment: totalPoints - computedPoints,
    correctPredictions: correctPredictions + tournamentScore.correct,
    incorrectPredictions: finishedResults.length - correctPredictions,
    scoredPredictions: finishedResults.length,
    bestStreak: longestStreak(
      finishedResults.map((result) => ({
        dateMs: result.kickoffMs,
        matchNumber: result.matchNumber,
        correct: result.correct,
      })),
    ),
    scoringRule:
      totalPoints === computedPoints
        ? "3 points per correct daily or tournament prediction"
        : "3 points per correct prediction, plus the approved final adjustment",
    finishedResults,
    pendingPredictions,
  };
}

/**
 * Build the final ranked leaderboard from daily match and tournament predictions.
 * Every correct scored field earns 3 points.
 */
export async function computeLeaderboard(
  supabase: SupabaseClient,
): Promise<LeaderboardEntry[]> {
  const { results, matchPredictions, tournamentPredictions } =
    await buildScoredMap(supabase);
  return scoreAndRank(matchPredictions, tournamentPredictions, results).entries;
}

export async function lookupPersonalScore(
  supabase: SupabaseClient,
  query: string,
): Promise<MeResponse> {
  const queryLower = query.toLowerCase();
  const { results, matchPredictions, tournamentPredictions } =
    await buildScoredMap(supabase);
  const { rankMap } = scoreAndRank(
    matchPredictions,
    tournamentPredictions,
    results,
  );
  const predictions = [...matchPredictions, ...tournamentPredictions];

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
    const tournamentPrediction = tournamentPredictions.find(
      (prediction) =>
        prediction.student_id?.toLowerCase() === studentKey,
    );
    return {
      status: "success",
      entry: buildPersonalEntry(
        representative,
        detailed,
        results,
        tournamentPrediction,
        rank,
      ),
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
  const tournamentPrediction = tournamentPredictions.find((prediction) =>
    representative.student_id
      ? prediction.student_id?.toLowerCase() === representative.student_id.toLowerCase()
      : prediction.full_name.toLowerCase() === representative.full_name.toLowerCase(),
  );

  return {
    status: "success",
    entry: buildPersonalEntry(
      representative,
      detailed,
      results,
      tournamentPrediction,
      rank,
    ),
  };
}
