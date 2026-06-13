"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import { COUNTRIES, PLAYERS, PLAYER_STAT_MAX, fixtureLabel, type Player, type Confederation } from "@/lib/data";
import type { FifaFixture } from "@/lib/fixtures";

// ─── shared filter pill ───────────────────────────────────────────────────────

function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] font-medium transition-all cursor-pointer ${
            value === o.value
              ? "bg-gold text-midnight"
              : "border border-frost/20 text-frost/55 hover:border-frost/45 hover:text-frost"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── fixtures tab ─────────────────────────────────────────────────────────────

type GroupFilter = "All" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

const GROUP_OPTIONS: { label: string; value: GroupFilter }[] = [
  { label: "All", value: "All" },
  ...("ABCDEFGHIJKL".split("").map((g) => ({ label: `Group ${g}`, value: g as GroupFilter }))),
];

function teamFlag(name: string | null): string {
  if (!name) return "🏳️";
  return COUNTRIES.find((c) => c.name === name)?.flag ?? "🏳️";
}

function FixtureRow({ fixture }: { fixture: FifaFixture }) {
  const when = new Date(fixture.date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const isLive = fixture.matchStatus === 1;
  const isDone = fixture.matchStatus === 3;
  const label = fixtureLabel(fixture);
  const tbd = !fixture.homeTeam || !fixture.awayTeam;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.012 }}
      className="glass rounded-2xl px-5 py-5 md:px-8 md:py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3"
    >
      {tbd ? (
        <div className="col-span-3 text-center text-frost/35 text-sm py-2">{label}</div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-3 text-right">
            <span className="font-medium text-frost text-sm md:text-base">{fixture.homeTeam}</span>
            <span className="text-2xl md:text-3xl">{teamFlag(fixture.homeTeam)}</span>
          </div>
          <div className="text-center px-2 md:px-5">
            {isDone && fixture.homeScore !== null ? (
              <span className="text-numeric block text-gold text-base md:text-xl font-semibold">
                {fixture.homeScore} – {fixture.awayScore}
              </span>
            ) : isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson/20 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-widest text-crimson font-semibold">
                <span className="size-1.5 rounded-full bg-crimson animate-pulse-dot" />
                LIVE
              </span>
            ) : (
              <span className="text-numeric block text-gold text-base md:text-xl font-semibold">VS</span>
            )}
            <span className="block text-[0.6rem] uppercase tracking-[0.16em] text-frost/40 mt-1 whitespace-nowrap">
              {fixture.group ?? fixture.stage}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">{teamFlag(fixture.awayTeam)}</span>
            <span className="font-medium text-frost text-sm md:text-base">{fixture.awayTeam}</span>
          </div>
        </>
      )}
      <div className="col-span-3 mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-frost/8 pt-2.5 text-[0.62rem] uppercase tracking-[0.14em] text-frost/35">
        <span>{when}</span>
        <span className="hidden sm:inline">·</span>
        <span>{fixture.venue}</span>
        <span className="hidden sm:inline">·</span>
        <span>#{fixture.matchNumber}</span>
      </div>
    </motion.div>
  );
}

const PAGE_SIZE = 10;

// Maps the /api/fixtures response back to the FifaFixture shape FixtureRow uses.
type ApiFixture = {
  eventId: string | null;
  matchNumber: number;
  stage: FifaFixture["stage"];
  group: FifaFixture["group"];
  kickoff: string;
  venue: string;
  city: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeAbbr: string | null;
  awayAbbr: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: FifaFixture["matchStatus"];
  placeholderA: string;
  placeholderB: string;
};

function toFifaFixture(f: ApiFixture): FifaFixture {
  return {
    matchNumber: f.matchNumber,
    stage: f.stage,
    group: f.group,
    date: f.kickoff,
    venue: f.venue,
    city: f.city,
    homeTeam: f.homeTeam,
    awayTeam: f.awayTeam,
    homeAbbr: f.homeAbbr,
    awayAbbr: f.awayAbbr,
    placeholderA: f.placeholderA,
    placeholderB: f.placeholderB,
    homeScore: f.homeScore,
    awayScore: f.awayScore,
    matchStatus: f.status,
    eventId: f.eventId,
  };
}

function FixturesPanel() {
  const [group, setGroup] = React.useState<GroupFilter>("All");
  const [page, setPage] = React.useState(1);
  const [fixtures, setFixtures] = React.useState<FifaFixture[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const list: ApiFixture[] = data.fixtures ?? [];
        setFixtures(list.map(toFifaFixture));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = group === "All"
    ? fixtures
    : fixtures.filter((f) => f.group === `Group ${group}`);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeGroup = (g: GroupFilter) => { setGroup(g); setPage(1); };

  return (
    <>
      <FilterPills options={GROUP_OPTIONS} value={group} onChange={changeGroup} />

      <div className="grid gap-3 max-w-3xl mx-auto">
        <AnimatePresence mode="popLayout">
          {pageItems.map((f) => (
            <FixtureRow key={f.eventId ?? `m${f.matchNumber}`} fixture={f} />
          ))}
        </AnimatePresence>
        {loading && fixtures.length === 0 && (
          <p className="text-center text-frost/35 py-10 text-sm">Loading fixtures…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-frost/35 py-10 text-sm">No fixtures for Group {group}.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1.5 rounded-full border border-frost/20 px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-frost/55 transition-all hover:border-frost/45 hover:text-frost disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
              const isActive = n === safePage;
              const nearActive = Math.abs(n - safePage) <= 1;
              const isEdge = n === 1 || n === totalPages;
              if (!nearActive && !isEdge) {
                if (n === 2 || n === totalPages - 1) {
                  return <span key={n} className="text-frost/25 text-xs px-0.5">…</span>;
                }
                return null;
              }
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`size-8 rounded-full text-[0.7rem] font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-gold text-midnight"
                      : "border border-frost/20 text-frost/50 hover:border-frost/45 hover:text-frost"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center gap-1.5 rounded-full border border-frost/20 px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-frost/55 transition-all hover:border-frost/45 hover:text-frost disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}

      <p className="mt-3 text-center text-[0.6rem] uppercase tracking-[0.18em] text-frost/25">
        {filtered.length} fixtures · Page {safePage} of {totalPages}
      </p>
    </>
  );
}

// ─── groups bracket tab ───────────────────────────────────────────────────────

const CONF_COLORS: Record<string, string> = {
  UEFA: "text-blue-400",
  CONMEBOL: "bg-turf/15 text-turf",
  CONCACAF: "bg-gold/15 text-gold",
  AFC: "bg-orange-400/15 text-orange-400",
  CAF: "bg-crimson/15 text-crimson",
  OFC: "bg-frost/10 text-frost/60",
};

function GroupCard({ letter, teams }: { letter: string; teams: (typeof COUNTRIES)[number][] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-frost/8 flex items-center justify-between">
        <span className="text-display text-2xl text-gold">Group {letter}</span>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-frost/35">
          {teams.length} Teams
        </span>
      </div>
      <div className="divide-y divide-frost/6">
        {teams.map((t, i) => (
          <motion.div
            key={t.code}
            whileHover={{ x: 4, backgroundColor: "rgba(226,232,240,0.03)" }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-3 px-5 py-3"
          >
            <span className="text-[0.6rem] text-numeric text-frost/30 w-4 shrink-0">{i + 1}</span>
            <span className="text-2xl shrink-0">{t.flag}</span>
            <span className="flex-1 text-sm text-frost font-medium leading-tight">{t.name}</span>
            {t.titles > 0 && (
              <span className="text-[0.55rem] text-gold/80">🏆{t.titles}</span>
            )}
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[0.52rem] uppercase tracking-wider font-medium ${
                CONF_COLORS[t.confederation] ?? "text-frost/40"
              }`}
            >
              {t.confederation === "CONMEBOL" ? "S.AM" : t.confederation}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function GroupsPanel() {
  const groups = React.useMemo(() => {
    const map = new Map<string, (typeof COUNTRIES)[number][]>();
    for (const c of COUNTRIES) {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, teams]) => ({
        letter,
        teams: teams.sort((a, b) => a.fifaRank - b.fifaRank),
      }));
  }, []);

  return (
    <>
      <p className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-frost/35 mb-10">
        12 Groups · 4 Teams Each · Ranked by FIFA Standing
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groups.map((g) => (
          <GroupCard key={g.letter} letter={g.letter} teams={g.teams} />
        ))}
      </div>
    </>
  );
}

// ─── nations tab ──────────────────────────────────────────────────────────────

type ConfFilter = "All" | Confederation;

const CONF_OPTIONS: { label: string; value: ConfFilter }[] = [
  { label: "All 48", value: "All" },
  { label: "UEFA", value: "UEFA" },
  { label: "CONMEBOL", value: "CONMEBOL" },
  { label: "CAF", value: "CAF" },
  { label: "AFC", value: "AFC" },
  { label: "CONCACAF", value: "CONCACAF" },
  { label: "OFC", value: "OFC" },
];

function CountryCard({ country }: { country: (typeof COUNTRIES)[number] }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ rotateY: -7, rotateX: 4, y: -6 }}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      className="glass group relative rounded-2xl p-5 text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,214,10,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <span className="block text-5xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110">
        {country.flag}
      </span>
      <h3 className="text-display mt-3 text-xl text-frost leading-tight">{country.name}</h3>
      <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold/70">
        {country.confederation}
      </p>
      <div className="mt-2.5 flex items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.14em] text-frost/40">
        <span>Rank <span className="text-numeric text-frost/70">#{country.fifaRank}</span></span>
        <span>Grp <span className="text-numeric text-frost/70">{country.group}</span></span>
        {country.titles > 0 && (
          <span>🏆 <span className="text-numeric text-gold">{country.titles}</span></span>
        )}
      </div>
    </motion.div>
  );
}

function NationsPanel() {
  const [conf, setConf] = React.useState<ConfFilter>("All");

  const filtered = conf === "All"
    ? COUNTRIES
    : COUNTRIES.filter((c) => c.confederation === conf);

  return (
    <>
      <FilterPills options={CONF_OPTIONS} value={conf} onChange={setConf} />
      <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <CountryCard key={c.code} country={c} />
          ))}
        </AnimatePresence>
      </motion.div>
      <p className="mt-6 text-center text-[0.62rem] uppercase tracking-[0.18em] text-frost/30">
        {filtered.length} {conf === "All" ? "nations" : conf + " nations"} · Groups A–L · 48 total
      </p>
    </>
  );
}

// ─── player card ──────────────────────────────────────────────────────────────

function StatBar({ label, value, max }: { label: string; value: number | null; max: number }) {
  if (value === null) {
    return (
      <div>
        <div className="flex justify-between text-[0.65rem] uppercase tracking-[0.18em] text-frost/50 mb-1.5">
          <span>{label}</span>
          <span className="text-frost/25">—</span>
        </div>
        <div className="h-1.5 rounded-full bg-frost/10" />
      </div>
    );
  }
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-[0.65rem] uppercase tracking-[0.18em] text-frost/50 mb-1.5">
        <span>{label}</span>
        <span className="text-numeric text-gold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-frost/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-crimson via-gold to-gold"
        />
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [spot, setSpot] = React.useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <StaggerItem>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="glass glass-gold group relative rounded-2xl overflow-hidden"
      >
        {/* cursor glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, rgba(255,214,10,0.10), transparent 55%)`,
          }}
          aria-hidden="true"
        />

        {/* player photo */}
        <div className="relative h-52 w-full bg-gradient-to-b from-frost/5 to-transparent overflow-hidden">
          <Image
            src={player.photo}
            alt={player.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain object-bottom drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105"
          />
          {/* flag badge */}
          <span className="absolute top-3 right-3 text-3xl drop-shadow-lg">{player.flag}</span>
        </div>

        {/* info + stats */}
        <div className="p-5 pt-4 relative z-10">
          <h3 className="text-display text-2xl text-frost leading-tight">{player.name}</h3>
          <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-frost/45">
            {player.position} · {player.club}
          </p>
          <div className="mt-4 space-y-3">
            <StatBar label="Intl Caps"     value={player.stats.intlCaps}    max={PLAYER_STAT_MAX.intlCaps} />
            <StatBar label="Intl Goals"    value={player.stats.intlGoals}   max={PLAYER_STAT_MAX.intlGoals} />
            <StatBar label="24/25 Goals"   value={player.stats.clubGoals}   max={PLAYER_STAT_MAX.clubGoals} />
            <StatBar label="24/25 Assists" value={player.stats.clubAssists} max={PLAYER_STAT_MAX.clubAssists} />
          </div>
        </div>
      </motion.div>
    </StaggerItem>
  );
}

// ─── section ──────────────────────────────────────────────────────────────────

export function MatchCenter() {
  return (
    <section id="matches" aria-label="FIFA World Cup 2026 Match Fixtures" className="relative px-6 py-28 md:py-40 bg-grid-faint">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          kicker="Match Center"
          title="Fixtures. 48 Nations. Superstars."
          copy="Filter by group or confederation. Lock in your call before kickoff."
        />

        <Tabs defaultValue="fixtures" className="flex flex-col items-center">
          <TabsList className="mb-10">
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="nations">48 Nations</TabsTrigger>
            <TabsTrigger value="players">Star Players</TabsTrigger>
          </TabsList>

          <TabsContent value="fixtures" className="w-full">
            <FixturesPanel />
          </TabsContent>

          <TabsContent value="groups" className="w-full">
            <GroupsPanel />
          </TabsContent>

          <TabsContent value="nations" className="w-full">
            <NationsPanel />
          </TabsContent>

          <TabsContent value="players" className="w-full">
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PLAYERS.map((p) => (
                <PlayerCard key={p.name} player={p} />
              ))}
            </Stagger>
            <p className="mt-8 text-center text-[0.6rem] uppercase tracking-[0.18em] text-frost/25">
              Career intl &amp; 2024/25 club stats · Wikipedia / official federation records · Photos: TheSportsDB
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
