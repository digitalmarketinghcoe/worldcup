import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Returns every form submission from both tables. Admin-only.
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured." },
      { status: 503 },
    );
  }

  const [predictions, matchPredictions] = await Promise.all([
    supabase.from("predictions").select("*").order("created_at", { ascending: false }),
    supabase.from("match_predictions").select("*").order("created_at", { ascending: false }),
  ]);

  if (predictions.error || matchPredictions.error) {
    console.error("Admin data fetch failed:", predictions.error, matchPredictions.error);
    return NextResponse.json({ ok: false, error: "Could not load data." }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    predictions: predictions.data ?? [],
    matchPredictions: matchPredictions.data ?? [],
  });
}
