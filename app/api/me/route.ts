import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { lookupPersonalScore } from "@/lib/leaderboard";
import type { MeResponse } from "@/lib/me-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";
  const query = raw.trim();

  if (!query || query.length > 80) {
    const res: MeResponse = {
      status: "validation_error",
      message: "Enter a name or Student ID to search.",
    };
    return NextResponse.json(res, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const res: MeResponse = { status: "service_unavailable" };
    return NextResponse.json(res, { status: 503 });
  }

  try {
    const result = await lookupPersonalScore(supabase, query);
    const status =
      result.status === "success"
        ? 200
        : result.status === "not_found"
          ? 404
          : result.status === "ambiguous"
            ? 200
            : result.status === "validation_error"
              ? 400
              : 503;
    return NextResponse.json(result, { status });
  } catch {
    const res: MeResponse = { status: "service_unavailable" };
    return NextResponse.json(res, { status: 503 });
  }
}
