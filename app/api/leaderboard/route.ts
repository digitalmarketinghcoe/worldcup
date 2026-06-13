import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { computeLeaderboard, REFRESH_MS } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

// Real standings from user predictions. Materialized into leaderboard_snapshot
// and refreshed at most once every 12 hours (lazy — recomputed on the first
// read after the snapshot goes stale; no cron required).
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: true, entries: [], computedAt: null });
  }

  const { data: snap } = await supabase
    .from("leaderboard_snapshot")
    .select("computed_at, entries")
    .eq("id", 1)
    .maybeSingle();

  const fresh =
    snap && Date.now() - new Date(snap.computed_at).getTime() < REFRESH_MS;

  if (fresh) {
    return NextResponse.json({ ok: true, entries: snap!.entries, computedAt: snap!.computed_at });
  }

  try {
    const entries = await computeLeaderboard(supabase);
    const computedAt = new Date().toISOString();
    await supabase
      .from("leaderboard_snapshot")
      .upsert({ id: 1, computed_at: computedAt, entries });
    return NextResponse.json({ ok: true, entries, computedAt });
  } catch (err) {
    console.error("Leaderboard compute failed:", err);
    // Serve the stale snapshot if we have one, rather than nothing.
    if (snap) {
      return NextResponse.json({ ok: true, entries: snap.entries, computedAt: snap.computed_at });
    }
    return NextResponse.json({ ok: true, entries: [], computedAt: null });
  }
}
