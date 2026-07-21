export type Outcome = "home" | "draw" | "away";

export type MatchResultDetail = {
  matchNumber: number;
  matchLabel: string;
  homeTeam: string;
  awayTeam: string;
  predicted: Outcome;
  actual: Outcome;
  correct: boolean;
  points: number;
  kickoffMs: number;
};

export type PendingPrediction = {
  matchNumber: number;
  matchLabel: string;
  homeTeam: string;
  awayTeam: string;
  predicted: Outcome;
};

export type PersonalEntry = {
  fullName: string;
  program: string;
  maskedStudentId: string;
  rank: number;
  totalPoints: number;
  matchPoints: number;
  tournamentPoints: number;
  manualAdjustment: number;
  correctPredictions: number;
  incorrectPredictions: number;
  scoredPredictions: number;
  bestStreak: number;
  scoringRule: string;
  finishedResults: MatchResultDetail[];
  pendingPredictions: PendingPrediction[];
};

export type MeResponse =
  | { status: "success"; entry: PersonalEntry }
  | { status: "ambiguous"; message: string }
  | { status: "not_found" }
  | { status: "validation_error"; message: string }
  | { status: "service_unavailable" };
