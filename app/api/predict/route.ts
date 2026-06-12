import { NextResponse } from "next/server";
import { COUNTRIES, PROGRAMS } from "@/lib/data";

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

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const record = {
    timestamp: new Date().toISOString(),
    fullName: body.fullName!.trim(),
    studentId: body.studentId!.trim(),
    program: body.program,
    goldenBall: body.goldenBall!.trim(),
    goldenBoot: body.goldenBoot!.trim(),
    youngPlayer: body.youngPlayer!.trim(),
    goldenGloves: body.goldenGloves!.trim(),
    finalScore: body.finalScore!.trim(),
    finalTeam: body.finalTeam,
    finalMatchGoalScorer: body.finalMatchGoalScorer!.trim(),
    bestXI: body.bestXI!.trim(),
    firstPlace: body.firstPlace,
    secondPlace: body.secondPlace,
    thirdPlace: body.thirdPlace,
    secret: process.env.GOOGLE_SCRIPT_SECRET ?? "",
  };

  if (!scriptUrl) {
    // Dev fallback: accept locally so the UI flow works before the sheet is wired up.
    console.warn("GOOGLE_SCRIPT_URL not set — prediction logged locally only:", record);
    return NextResponse.json({ ok: true, stored: "local" });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      // Apps Script web apps respond with a 302 to the result; follow it.
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Apps Script responded ${res.status}`);
    return NextResponse.json({ ok: true, stored: "sheet" });
  } catch (err) {
    console.error("Prediction forwarding failed:", err);
    return NextResponse.json(
      { ok: false, errors: ["Could not save your prediction. Try again in a moment."] },
      { status: 502 },
    );
  }
}
