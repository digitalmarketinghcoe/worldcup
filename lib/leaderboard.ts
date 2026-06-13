import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardEntry } from "@/lib/data";
import { getFixtures } from "@/lib/fixtures-api";

export const POINTS_PER_CORRECT = 3;
export const REFRESH_MS = 12 * 60 * 60 * 1000; // 12 hours

type Outcome = "home" | "draw" | "away";

type PredictionRow = {
  full_name: string;
  student_id: string | null;
  program: string;
  event_id: string;
  outcome: Outcome;
};

/** Actual result of a finished fixture, keyed by provider event id. */
function finishedResults(
  fixtures: Awaited<ReturnType<typeof getFixtures>>,
): Map<string, { outcome: Outcome; dateMs: number }> {
  const map = new Map<string, { outcome: Outcome; dateMs: number }>();
  for (const f of fixtures) {
    if (
      f.eventId &&
      f.matchStatus === 3 &&
      f.homeScore !== null &&
      f.awayScore !== null
    ) {
      const outcome: Outcome =
        f.homeScore > f.awayScore ? "home" : f.homeScore < f.awayScore ? "away" : "draw";
      map.set(f.eventId, { outcome, dateMs: new Date(f.date).getTime() });
    }
  }
  return map;
}

/** Longest run of consecutive correct calls, ordered by match kickoff. */
function longestStreak(results: { dateMs: number; correct: boolean }[]): number {
  const ordered = [...results].sort((a, b) => a.dateMs - b.dateMs);
  let best = 0;
  let run = 0;
  for (const r of ordered) {
    run = r.correct ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

/**
 * Build the ranked leaderboard from match predictions vs. finished fixtures.
 * 3 points per correctly predicted match winner.
 */
export async function computeLeaderboard(
  supabase: SupabaseClient,
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("match_predictions")
    .select("full_name, student_id, program, event_id, outcome");
  if (error) throw error;

  const predictions = (data ?? []) as PredictionRow[];
  const results = finishedResults(await getFixtures());

  type Acc = {
    name: string;
    program: string;
    correct: number;
    calls: { dateMs: number; correct: boolean }[];
  };
  const byStudent = new Map<string, Acc>();

  for (const p of predictions) {
    const actual = results.get(p.event_id);
    if (!actual) continue; // match not finished yet — doesn't score
    // Faculty entrants may have no student ID — fall back to name as the key.
    const key = (p.student_id ?? `name:${p.full_name}`).toLowerCase();
    const acc =
      byStudent.get(key) ??
      { name: p.full_name, program: p.program, correct: 0, calls: [] };
    const isCorrect = p.outcome === actual.outcome;
    if (isCorrect) acc.correct += 1;
    acc.calls.push({ dateMs: actual.dateMs, correct: isCorrect });
    byStudent.set(key, acc);
  }

  const ranked = [...byStudent.values()]
    .map((a) => ({
      name: a.name,
      program: a.program,
      points: a.correct * POINTS_PER_CORRECT,
      correct: a.correct,
      streak: longestStreak(a.calls),
    }))
    .sort((a, b) => b.points - a.points || b.correct - a.correct || a.name.localeCompare(b.name))
    .map((e, i) => ({ rank: i + 1, ...e }));

  return ranked;
}
