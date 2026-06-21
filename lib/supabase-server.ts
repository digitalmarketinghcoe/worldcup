import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// PostgREST caps a single response at `max-rows` (default 1000). Any unbounded
// .select() silently truncates beyond that. Page through with .range() so we
// always get the full set regardless of table size.
const PAGE_SIZE = 1000;

// Minimal structural type for any Supabase select builder: it exposes .range()
// and resolves to { data, error }. Typed loosely so we don't couple to
// postgrest-js's 8-generic builder signature, which isn't re-exported.
type RangeableQuery<T> = {
  range(
    from: number,
    to: number,
  ): PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
};

/**
 * Fetch every row matching a query, paginating past PostgREST's 1000-row cap.
 * Pass a query builder *before* awaiting it, e.g.:
 *   selectAll(supabase.from("t").select("*").order("id"))
 * An explicit .order() is recommended so pages don't overlap or skip rows.
 */
export async function selectAll<T>(query: RangeableQuery<T>): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return all;
}

/**
 * Server-only Supabase client using the service-role key.
 * Never import this from a client component — the service-role key
 * bypasses Row Level Security and must stay on the server.
 *
 * Returns null when env vars are missing so callers can use a dev fallback.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
