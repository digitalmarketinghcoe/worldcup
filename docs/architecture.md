# HCOE World Cup Fan Zone 2026 — Architecture

## Sitemap

```mermaid
graph TD
    ROOT["/ — Fan Zone (single-page experience)"]
    ROOT --> HERO["#hero — Cinematic Hero"]
    ROOT --> INTRO["#intro — World Cup Introduction"]
    ROOT --> COUNT["#countdown — Countdown Timer"]
    ROOT --> PREDICT["#predict — Prediction Challenge"]
    ROOT --> MATCHES["#matches — Match Center"]
    ROOT --> BOARD["#leaderboard — Leaderboard"]
    ROOT --> PRIZES["#prizes — Prize Cabinet"]
    ROOT --> HCOE["#hcoe — HCOE Beyond The Classroom"]
    ROOT --> FOOTER["Footer"]
    API["/api/predict — Route Handler (POST)"]
    PREDICT -.submits.-> API
```

## Component Hierarchy

```mermaid
graph TD
    L["app/layout.tsx<br/>fonts · metadata · SmoothScroll · noise overlay"]
    P["app/page.tsx (Server Component)"]
    L --> P
    P --> Hero --> HeroScene["three/hero-scene.tsx<br/>R3F Canvas: Football · Trophy · Particles · Rig"]
    Hero --> Btn1["ui/button (magnetic)"]
    P --> Intro --> CountUp
    P --> Countdown --> FlipDigit
    P --> Predictions --> Form["ui/input · ui/button"]
    Predictions --> ShareCard["lib/share-card.ts (canvas PNG)"]
    P --> MatchCenter --> Tabs["ui/tabs"]
    Tabs --> FixtureRow & CountryCard & PlayerCard
    P --> Leaderboard --> RankRow
    P --> Prizes
    P --> HcoeShowcase
    P --> Footer
    M["motion/reveal.tsx<br/>Reveal · Stagger · SectionHeading"]
    Intro -.uses.-> M
    MatchCenter -.uses.-> M
    Leaderboard -.uses.-> M
```

## User Flow

```mermaid
flowchart LR
    A[Land on hero] --> B{Hooked?}
    B -->|Scroll| C[Intro stats count up]
    C --> D[Countdown urgency]
    D --> E[Prediction form]
    E --> F[POST /api/predict]
    F -->|valid| G[Apps Script → Google Sheet]
    F -->|invalid| E
    G --> H[Animated success + share card]
    H --> I[WhatsApp / Facebook / IG story export]
    I --> J[Friends visit site] --> A
    H --> K[Check leaderboard] --> L[Return on next match day]
```

## Prediction Data Flow

```mermaid
sequenceDiagram
    participant U as Student
    participant F as Prediction Form (client)
    participant R as /api/predict (Route Handler)
    participant S as Google Apps Script
    participant G as Google Sheet

    U->>F: Fill name, ID, program, pick, champion
    F->>F: Client-side validation
    F->>R: POST JSON
    R->>R: Server-side validation (whitelisted picks)
    R->>S: fetch POST + shared secret
    S->>S: Verify secret
    S->>G: appendRow()
    S-->>R: { ok: true }
    R-->>F: { ok: true }
    F->>U: Success animation + canvas share card
```

## Animation Flow Map

```mermaid
timeline
    title Hero cinematic load sequence (seconds)
    0.0 : Screen dark
    0.3 : Stadium floodlights flicker on (beams gradient)
    0.9 : 3D scene fades in — trophy + football + particles
    1.4 : Kicker badge rises
    1.7 : "ENGINEERING / MEETS FOOTBALL" headline slides up (staggered)
    2.4 : Flag ticker starts
    2.7 : HCOE logo fades in
    3.0 : CTAs enter (magnetic hover armed)
```

Per-section motion: every section uses `Reveal` (translateY + fade, expo-out ease) and
`Stagger`/`StaggerItem` (90ms cascade). Stat bars and rank bars animate width on
viewport entry. Countdown digits flip vertically each second. All motion respects
`prefers-reduced-motion`.

## Design System

| Token | Value | Role |
|---|---|---|
| `--color-pitch` | `#020617` | Page background |
| `--color-midnight` | `#071124` | Surfaces / primary |
| `--color-crimson` | `#D90429` | Secondary / energy |
| `--color-gold` | `#FFD60A` | Accent / CTAs / trophy |
| `--color-turf` | `#00D26A` | Success |
| `--color-frost` | `#E2E8F0` | Text |

Typography: Bebas Neue (display, `.text-display`), Inter (body), Space Grotesk
(numerals, `.text-numeric`). Fluid scale via `clamp()` custom properties
(`--fs-hero` … `--fs-caption`). Surfaces use `.glass` (+ `-gold` / `-crimson`
glow variants); a fixed SVG-turbulence `.noise` overlay gives broadcast grain.

## Tech Notes

- Next.js 16 App Router; `app/page.tsx` is a Server Component, sections are client islands.
- React Three Fiber canvas is `next/dynamic` (`ssr: false`) so Three.js never blocks first paint; DPR capped at 1.75, fog culls distant particles.
- Lenis smooth scroll wraps the page from the root layout.
- shadcn-style primitives (button/card/input/tabs) hand-rolled with `cva` + `tailwind-merge` to keep the bundle lean — no Radix runtime needed for this page.
