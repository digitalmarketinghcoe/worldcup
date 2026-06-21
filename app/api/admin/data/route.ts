import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getSupabaseAdmin, selectAll } from "@/lib/supabase-server";

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

  // selectAll pages past PostgREST's 1000-row cap. `id` is the stable tiebreaker
  // so rows aren't skipped/duplicated across page boundaries on equal created_at.
  try {
    const [predictions, matchPredictions] = await Promise.all([
      selectAll(
        supabase
          .from("predictions")
          .select("*")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false }),
      ),
      selectAll(
        supabase
          .from("match_predictions")
          .select("*")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false }),
      ),
    ]);

    return NextResponse.json({ ok: true, predictions, matchPredictions });
  } catch (err) {
    console.error("Admin data fetch failed:", err);
    return NextResponse.json({ ok: false, error: "Could not load data." }, { status: 502 });
  }
}
