import { NextResponse } from "next/server";
import { PROGRAMS } from "@/lib/data";
import { fixtureLabel } from "@/lib/fixtures";
import { getFixtureByEventId } from "@/lib/fixtures-api";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Outcome = "home" | "draw" | "away";

type MatchPredictionPayload = {
  fullName: string;
  studentId: string;
  program: string;
  eventId: string;
  outcome: Outcome;
};

const OUTCOMES: Outcome[] = ["home", "draw", "away"];

export async function POST(request: Request) {
  let body: Partial<MatchPredictionPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Invalid JSON body."] },
      { status: 400 },
    );
  }

  const errors: string[] = [];
  const fullName = body.fullName?.trim() ?? "";
  const studentId = body.studentId?.trim() ?? "";

  const isFaculty = body.program === "Faculty";

  if (fullName.length < 3 || fullName.length > 80)
    errors.push("Full name must be 3–80 characters.");
  // Student ID is optional for faculty; if present it must still be well-formed.
  if ((!isFaculty || studentId) && !/^[A-Za-z0-9/-]{4,20}$/.test(studentId))
    errors.push("Student ID looks invalid.");
  if (!PROGRAMS.includes(body.program ?? ""))
    errors.push("Unknown program.");
  if (!body.outcome || !OUTCOMES.includes(body.outcome))
    errors.push("Pick who wins (home, draw, or away).");
  if (!body.eventId || typeof body.eventId !== "string")
    errors.push("Pick a match to predict.");

  // The match must be a real, live fixture with both teams known and not finished.
  const fixture =
    body.eventId && typeof body.eventId === "string"
      ? await getFixtureByEventId(body.eventId)
      : null;

  if (body.eventId && (!fixture || !fixture.homeTeam || !fixture.awayTeam)) {
    errors.push("Pick a valid match to predict.");
  } else if (fixture?.matchStatus === 3) {
    errors.push("That match has already finished.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const row = {
    full_name: fullName,
    student_id: studentId || null,
    program: body.program!,
    event_id: fixture!.eventId!,
    match_number: fixture!.matchNumber,
    match_label: fixtureLabel(fixture!),
    home_team: fixture!.homeTeam!,
    away_team: fixture!.awayTeam!,
    outcome: body.outcome!,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn("Supabase env not set — match prediction logged locally only:", row);
    return NextResponse.json({ ok: true, stored: "local" });
  }

  const { error } = await supabase.from("match_predictions").insert(row);

  if (error) {
    // 23505 = unique_violation — student already predicted this match
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: false, errors: ["You've already predicted this match."] },
        { status: 409 },
      );
    }
    console.error("Match prediction insert failed:", error);
    return NextResponse.json(
      { ok: false, errors: ["Could not save your prediction. Try again in a moment."] },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, stored: "supabase" });
}
