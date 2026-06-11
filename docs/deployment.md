# Deployment Guide — HCOE World Cup Fan Zone 2026

## 1. Prerequisites

- Node 20+
- A Google account (for the prediction sheet)
- A Vercel account (recommended host) or any Node host

## 2. Wire up the Google Sheets backend

1. Create a sheet at [sheets.new](https://sheets.new), name it **WC2026 Predictions**.
2. `Extensions → Apps Script`, replace the default file with [apps-script/Code.gs](../apps-script/Code.gs).
3. In the Apps Script editor: `Project Settings → Script properties` → add property
   `SECRET` with a long random string (e.g. output of `openssl rand -hex 24`).
4. `Deploy → New deployment → Web app`:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the web-app URL.

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfy.../exec
GOOGLE_SCRIPT_SECRET=<same value as the SECRET script property>
```

Without `GOOGLE_SCRIPT_URL` the app still runs — predictions are accepted and
logged server-side only (dev fallback), so the UI flow is testable immediately.

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

The secret stays server-side: the browser only ever talks to `/api/predict`;
the Route Handler attaches `GOOGLE_SCRIPT_SECRET` when forwarding to Apps Script.

## 6. Post-deploy checklist

- [ ] Submit a test prediction → row appears in the sheet
- [ ] OG card renders (paste URL into a WhatsApp chat) — add a real `public/og.png` (1200×630)
- [ ] Lighthouse run: Performance / SEO / Accessibility / Best Practices
- [ ] Test at 375px width (oldest common phone size on campus)
- [ ] Confirm countdown shows the correct target in Nepal time

## 7. Updating content

All tournament content lives in [lib/data.ts](../lib/data.ts):
fixtures, countries, players, leaderboard standings, prizes, programs.
Update standings there after each match day (or replace `LEADERBOARD` with a
fetch from the sheet via a second Apps Script `doGet`).
