# HCOE World Cup Fan Zone 2026

> **Engineering Meets Football.** A premium FIFA World Cup 2026 fan experience by
> Himalaya College of Engineering — predictions, leaderboard, prizes, and a
> cinematic dark-stadium aesthetic.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — app works without it (dev fallback)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's inside

| Area | Where |
|---|---|
| Page sections (hero → footer) | `components/sections/` |
| 3D hero scene (R3F: football, trophy, particles) | `components/three/hero-scene.tsx` |
| Motion primitives (Reveal, Stagger) | `components/motion/reveal.tsx` |
| shadcn-style UI primitives | `components/ui/` |
| Tournament content (fixtures, teams, players, standings) | `lib/data.ts` |
| Share-card PNG generator | `lib/share-card.ts` |
| Prediction API (validates + forwards to Google Sheet) | `app/api/predict/route.ts` |
| Google Apps Script backend | `apps-script/Code.gs` |
| Architecture & motion diagrams | `docs/architecture.md` |
| Deployment guide (Sheets + Vercel) | `docs/deployment.md` |
| Higgsfield video prompts | `creative/higgsfield-prompts/` |

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 ·
Framer Motion · React Three Fiber / Three.js · Lenis smooth scroll.

## Design system

- **Colors:** pitch `#020617`, midnight `#071124`, crimson `#D90429`, gold `#FFD60A`, turf `#00D26A`, frost `#E2E8F0`
- **Type:** Bebas Neue (display) · Inter (body) · Space Grotesk (numerals), fluid `clamp()` scale
- **Surfaces:** glassmorphism with gold/crimson glow variants, SVG grain overlay, stadium-beam gradients

## Deploy

See [docs/deployment.md](docs/deployment.md) — wire the Google Sheet via Apps
Script, set three env vars, `npx vercel --prod`.
