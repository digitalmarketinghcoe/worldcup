# Deployment Guide — HCOE World Cup Fan Zone 2026

## 1. Prerequisites

- Node 20+
- A Supabase account (free tier is enough) — [supabase.com](https://supabase.com)
- A Vercel account (recommended host) or any Node host

## 2. Wire up the Supabase backend

1. Create a new project at [database.new](https://database.new).
2. In the dashboard, open **SQL Editor** and run
   [supabase/migrations/0001_predictions.sql](../supabase/migrations/0001_predictions.sql).
   This creates the `predictions` table with validation checks, a
   one-entry-per-student unique index, and RLS enabled (deny-all — only the
   server's service-role key can write).
3. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role secret>
```

Without the Supabase vars the app still runs — predictions are accepted and
logged server-side only (dev fallback), so the UI flow is testable immediately.

> **Security:** the service-role key bypasses Row Level Security. It is only
> ever read inside [lib/supabase-server.ts](../lib/supabase-server.ts) (guarded
> by `server-only`) and never shipped to the browser. The browser only talks
> to `/api/predict`.

## 4. Local development

```bash
npm install
npm run dev
```

## 5. Deploy to Vercel

```bash
npx vercel
```

Set the three environment variables in **Vercel → Project → Settings →
Environment Variables**, then promote to production with `npx vercel --prod`.

## 6. Post-deploy checklist

- [ ] Submit a test prediction → row appears in Supabase **Table Editor → predictions**
- [ ] Submit again with the same student ID → friendly "already submitted" error
- [ ] OG card renders (paste URL into a WhatsApp chat) — add a real `public/og.png` (1200×630)
- [ ] Lighthouse run: Performance / SEO / Accessibility / Best Practices
- [ ] Test at 375px width (oldest common phone size on campus)
- [ ] Confirm countdown shows the correct target in Nepal time

## 7. Updating content

Fixtures are **live** — pulled from TheSportsDB (FIFA World Cup, league 4429,
season 2026) at request time by [lib/fixtures-api.ts](../lib/fixtures-api.ts),
which serves the group stage with real scores + status and merges the knockout
skeleton from [lib/fixtures.ts](../lib/fixtures.ts). If the API is unreachable
the app falls back to the static `FIFA_FIXTURES` array, so it always renders.
Set `THESPORTSDB_KEY` for higher rate limits (defaults to the free test key).

Everything else lives in [lib/data.ts](../lib/data.ts): countries, players,
leaderboard standings, prizes, programs. Update standings there after each match
day (or build a leaderboard from the `predictions` tables with a Supabase query).

## 8. Viewing / exporting entries

Supabase dashboard → **Table Editor → predictions**. Export as CSV from the
table view, or query in the SQL editor, e.g.:

```sql
select full_name, student_id, first_place, golden_ball, created_at
from public.predictions
order by created_at desc;
```
