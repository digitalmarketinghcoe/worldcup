export const TOURNAMENT_POINTS_PER_CORRECT = 3;

// Official FIFA World Cup 2026 results, entered manually after the Final.
// Best XI is intentionally not scored because FIFA did not publish an official
// tournament Best XI against which the free-text submissions could be judged.
export const TOURNAMENT_RESULTS = {
  goldenBall: "Rodri",
  goldenBoot: "Kylian Mbappé",
  youngPlayer: "Pau Cubarsí",
  goldenGloves: "Unai Simón",
  finalScore: "Spain 1-0 Argentina",
  finalTeam: "Spain",
  finalMatchGoalScorer: "Ferran Torres",
  firstPlace: "Spain",
  secondPlace: "Argentina",
  thirdPlace: "England",
} as const;

export type TournamentPrediction = {
  golden_ball: string;
  golden_boot: string;
  young_player: string;
  golden_gloves: string;
  final_score: string;
  final_team: string;
  final_match_goal_scorer: string;
  first_place: string;
  second_place: string;
  third_place: string;
};

export type TournamentScore = {
  correct: number;
  points: number;
};

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isOneNilToSpain(value: string): boolean {
  const normalized = normalize(value);

  // The form allowed either a bare score or a score with the finalists named.
  if (normalized === "1 0") return true;
  return /^spain 1 0 argentina$/.test(normalized);
}

function matches(value: string, accepted: readonly string[]): boolean {
  const normalized = normalize(value);
  return accepted.some((answer) => normalized === normalize(answer));
}

export function scoreTournamentPrediction(
  prediction: TournamentPrediction,
): TournamentScore {
  const correctAnswers = [
    matches(prediction.golden_ball, [TOURNAMENT_RESULTS.goldenBall]),
    matches(prediction.golden_boot, [
      TOURNAMENT_RESULTS.goldenBoot,
      "Mbappe",
      "Kylain Mbappe", // clear spelling variant present in the submissions
    ]),
    matches(prediction.young_player, [
      TOURNAMENT_RESULTS.youngPlayer,
      "Cubarsi",
    ]),
    matches(prediction.golden_gloves, [
      TOURNAMENT_RESULTS.goldenGloves,
      "Simon",
    ]),
    isOneNilToSpain(prediction.final_score),
    matches(prediction.final_team, [TOURNAMENT_RESULTS.finalTeam]),
    matches(prediction.final_match_goal_scorer, [
      TOURNAMENT_RESULTS.finalMatchGoalScorer,
    ]),
    matches(prediction.first_place, [TOURNAMENT_RESULTS.firstPlace]),
    matches(prediction.second_place, [TOURNAMENT_RESULTS.secondPlace]),
    matches(prediction.third_place, [TOURNAMENT_RESULTS.thirdPlace]),
  ].filter(Boolean).length;

  return {
    correct: correctAnswers,
    points: correctAnswers * TOURNAMENT_POINTS_PER_CORRECT,
  };
}
