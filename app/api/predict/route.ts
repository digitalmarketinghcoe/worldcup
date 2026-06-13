import { NextResponse } from "next/server";
import { COUNTRIES, PROGRAMS } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type PredictionPayload = {
  fullName: string;
  studentId: string;
  program: string;
  goldenBall: string;
  goldenBoot: string;
  youngPlayer: string;
  goldenGloves: string;
  finalScore: string;
  finalTeam: string;
  finalMatchGoalScorer: string;
  bestXI: string;
  firstPlace: string;
  secondPlace: string;
  thirdPlace: string;
};

const COUNTRY_NAMES = new Set(COUNTRIES.map((c) => c.name));

function validateText(
  value: string | undefined,
  field: string,
  max: number,
): string | null {
  const v = value?.trim() ?? "";
  if (!v) return `${field} is required.`;
  if (v.length > max) return `${field}: max ${max} characters.`;
  return null;
}

function validate(body: Partial<PredictionPayload>) {
  const errors: string[] = [];
  const fullName = body.fullName?.trim() ?? "";
  const studentId = body.studentId?.trim() ?? "";

  if (fullName.length < 3 || fullName.length > 80)
    errors.push("Full name must be 3–80 characters.");
  if (!/^[A-Za-z0-9/-]{4,20}$/.test(studentId))
    errors.push("Student ID looks invalid.");
  if (!PROGRAMS.includes(body.program ?? ""))
    errors.push("Unknown program.");

  const textFields: [keyof PredictionPayload, string, number][] = [
    ["goldenBall", "Golden Ball", 80],
    ["goldenBoot", "Golden Boot", 80],
    ["youngPlayer", "Young Player", 80],
    ["goldenGloves", "Golden Gloves", 80],
    ["finalScore", "Final score", 80],
    ["finalMatchGoalScorer", "Final match goal scorer", 80],
    ["bestXI", "Best XI", 600],
  ];
  for (const [key, label, max] of textFields) {
    const err = validateText(body[key], label, max);
    if (err) errors.push(err);
  }

  const selectFields: [keyof PredictionPayload, string][] = [
    ["finalTeam", "World Cup winner"],
    ["firstPlace", "1st place"],
    ["secondPlace", "2nd place"],
    ["thirdPlace", "3rd place"],
  ];
  for (const [key, label] of selectFields) {
    if (!COUNTRY_NAMES.has(body[key] ?? ""))
      errors.push(`${label}: unknown country.`);
  }

  if (
    COUNTRY_NAMES.has(body.firstPlace ?? "") &&
    COUNTRY_NAMES.has(body.secondPlace ?? "") &&
    COUNTRY_NAMES.has(body.thirdPlace ?? "") &&
    new Set([body.firstPlace, body.secondPlace, body.thirdPlace]).size < 3
  ) {
    errors.push("1st, 2nd, and 3rd place must be three different countries.");
  }

  return errors;
}

export async function POST(request: Request) {
  let body: Partial<PredictionPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Invalid JSON body."] },
      { status: 400 },
    );
  }

  const errors = validate(body);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const row = {
    full_name: body.fullName!.trim(),
    student_id: body.studentId!.trim(),
    program: body.program!,
    golden_ball: body.goldenBall!.trim(),
    golden_boot: body.goldenBoot!.trim(),
    young_player: body.youngPlayer!.trim(),
    golden_gloves: body.goldenGloves!.trim(),
    final_score: body.finalScore!.trim(),
    final_team: body.finalTeam!,
    final_match_goal_scorer: body.finalMatchGoalScorer!.trim(),
    best_xi: body.bestXI!.trim(),
    first_place: body.firstPlace!,
    second_place: body.secondPlace!,
    third_place: body.thirdPlace!,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Dev fallback: accept locally so the UI flow works before Supabase is wired up.
    console.warn("Supabase env not set — prediction logged locally only:", row);
    return NextResponse.json({ ok: true, stored: "local" });
  }

  const { error } = await supabase.from("predictions").insert(row);

  if (error) {
    // 23505 = unique_violation — student already submitted an entry
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: false, errors: ["This student ID has already submitted a prediction."] },
        { status: 409 },
      );
    }
    console.error("Prediction insert failed:", error);
    return NextResponse.json(
      { ok: false, errors: ["Could not save your prediction. Try again in a moment."] },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, stored: "supabase" });
}
